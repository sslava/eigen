#import "ARNewSubmissionFormComponentViewController.h"
#import "AREmission.h"

@implementation ARNewSubmissionFormComponentViewController

- (instancetype)init
{
    return [super initWithEmission:nil moduleName:@"ConsignmentsSubmissionForm" initialProperties:nil];
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor whiteColor];
}

@end
