#import "ARTNativeScreenPresenterModule.h"
#import "ARAugmentedVIRSetupViewController.h"
#import "ARAugmentedRealityConfig.h"
#import "ARAugmentedFloorBasedVIRViewController.h"
#import "ArtsyEcho.h"
#import "AROptions.h"
#import "ARModalViewController.h"
#import "ARAppDelegate+Echo.h"
#import "eigen-Swift.h"

@implementation ARTNativeScreenPresenterModule

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(presentAugmentedRealityVIR:(NSString *)imgUrl width:(CGFloat)widthIn height:(CGFloat)heightIn artworkSlug:(NSString *)artworkSlug artworkId:(NSString *)artworkId)
{
    BOOL supportsARVIR = [ARAugmentedVIRSetupViewController canOpenARView];
    if (!supportsARVIR) {
        // we don't expect emission to call this when there's no AR support
        return;
    }
    // A bit weird, eh? Normally CGSize stores width+height in terms of pixels, but this one is stored in inches instead.
    CGSize size = CGSizeMake(widthIn, heightIn);
    NSURL *url = [NSURL URLWithString:imgUrl];

    [ARAugmentedVIRSetupViewController canSkipARSetup:[NSUserDefaults standardUserDefaults] callback:^(bool allowedAccess) {
        // The image can come from either the SDWebImage cache or from the internet.
        // In either case, this block gets called with that image.
        void (^gotImageBlock)(UIImage *image) = ^void(UIImage *image) {
            ARAugmentedRealityConfig *config = [[ARAugmentedRealityConfig alloc] initWithImage:image size:size];
            config.artworkID = artworkId;
            config.artworkSlug = artworkSlug;
            config.floorBasedVIR = YES;
            config.debugMode =  [AROptions boolForOption:AROptionsDebugARVIR];

            if (allowedAccess) {
                ARAugmentedFloorBasedVIRViewController *viewInRoomVC = [[ARAugmentedFloorBasedVIRViewController alloc] initWithConfig:config];
                viewInRoomVC.modalTransitionStyle = UIModalTransitionStyleCrossDissolve;
                [[self.class currentlyPresentedVC] presentViewController:viewInRoomVC animated:YES completion:nil];
            } else {
                ArtsyEcho *echo = [[ArtsyEcho alloc] init];
                [echo setup];

                Message *setupURL = echo.messages[@"ARVIRVideo"];

                NSURL *movieURL = setupURL.content.length ? [NSURL URLWithString:setupURL.content] : nil;
                ARAugmentedVIRSetupViewController *setupVC = [[ARAugmentedVIRSetupViewController alloc] initWithMovieURL:movieURL config:config];
                setupVC.modalTransitionStyle = UIModalTransitionStyleCrossDissolve;
                [[self.class currentlyPresentedVC] presentViewController:setupVC animated:YES completion:nil];
            }
        };

        // Try to get a cached image from SDWebImage. This will succeed under normal runtime conditions.
        // But in case there is severe RAM or disk pressure, the image might already be evicted from the cache.
        // In the rare occurence that a cache lookup fails, download the image into the cache first.
        SDWebImageManager *manager = [SDWebImageManager sharedManager];
        NSString *key = [manager cacheKeyForURL:url];
                [manager.imageCache containsImageForKey:key cacheType:SDImageCacheTypeAll completion:^(SDImageCacheType containsCacheType) {
                    if (containsCacheType != SDImageCacheTypeNone) {
                        [manager.imageCache queryImageForKey:key options:0 context:nil cacheType:containsCacheType completion:^(UIImage * _Nullable image, NSData * _Nullable data, SDImageCacheType cacheType) {
                            // TODO: Verify that this _does_ actually get a cache hit most often.
                    gotImageBlock(image);
                        }];
                    } else {
                        [manager loadImageWithURL:url options:SDWebImageHighPriority progress:nil completed:^(UIImage * _Nullable image, NSData * _Nullable data, NSError * _Nullable error, SDImageCacheType cacheType, BOOL finished, NSURL * _Nullable imageURL) {
                            if (finished && !error) {
                                gotImageBlock(image);
                            } else {
                                // Errors are unlikely to happen, but we should handle them just in case.
                                // This represents both an image cache-miss _and_ a failure to
                                // download the image on its own. Very unlikely.
                                NSLog(@"[ARAppDelegate+Emission] Couldn't download image for AR VIR (%@, %@): %@", artworkSlug, imageURL, error);
                                UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"Failed to Load Image" message:@"We could not download the image to present in View-in-Room." preferredStyle:UIAlertControllerStyleAlert];
                                UIAlertAction *defaultAction = [UIAlertAction actionWithTitle:@"OK" style:UIAlertActionStyleDefault handler:nil];
                                [alert addAction:defaultAction];
                                [[ARTNativeScreenPresenterModule currentlyPresentedVC] presentViewController:alert animated:YES completion:nil];
                            }
                        }];
                    }
                }];
        }];
}

+ (UIViewController *)currentlyPresentedVC
{
    UIViewController *vc = [[ARAppDelegate sharedInstance] window].rootViewController;

    while ([vc presentedViewController] && [[vc presentedViewController] isKindOfClass:ARModalViewController.class]) {
        vc = [vc presentedViewController];
    }

    return vc;
}

@end
