import UIKit
import Interstellar
import FLKAutoLayout

class LiveAuctionToolbarView : UIView {

    var lotViewModel: LiveAuctionLotViewModelType!
    var auctionViewModel: LiveAuctionViewModelType!

    lazy var computedLotStateSignal: Signal<LotState> = {
        return self.lotViewModel.computedLotStateSignal(self.auctionViewModel)
    }()

    override func traitCollectionDidChange(previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)

        // Remove all subviews and call setupViews() again to start from scratch.
        subviews.forEach { $0.removeFromSuperview() }
        setupViews()
    }

    func lotCountString() -> NSAttributedString {
        return NSAttributedString(string: "\(lotViewModel.lotIndex)/\(auctionViewModel.lotCount)")
    }

    func attributify(string: String) -> NSAttributedString {
        return NSAttributedString(string: string)
    }

    func setupViews() {
        computedLotStateSignal.next { [weak self] lotState in
            self?.setupUsingState(lotState)
        }
    }

    func setupUsingState(lotState: LotState) {
        let viewStructure: [[String: NSAttributedString]]
        let clockClosure: (UILabel) -> ()
        switch lotState {
        case .ClosedLot:
            viewStructure = [
                ["lot": lotCountString()],
                ["time": attributify("Closed")],
                ["bidders": attributify("11")],
                ["watchers": attributify("09")]
            ]
            clockClosure = { label in
                // do timer
                label.text = "00:12"
            }

        case .LiveLot:
            viewStructure = [
                ["lot": lotCountString()],
                ["time": attributify("00:12")],
                ["bidders": attributify("11")],
                ["watchers": attributify("09")]
            ]
            clockClosure = { label in
                // do timer
                label.text = "00:12"
            }

        case let .UpcomingLot(distance):
            viewStructure = [
                ["lot": lotCountString()],
                ["time": attributify("")],
                ["watchers": attributify("09")]
            ]

            clockClosure = { label in
                label.text = "\(distance) lots away"
            }
        }

        let views:[UIView] = viewStructure.map { dict in
            let key = dict.keys.first!
            let thumbnail = UIImage(named: "lot_\(key)_info")

            let view = UIView()
            let thumbnailView = UIImageView(image: thumbnail)
            view.addSubview(thumbnailView)

            let label = ARSansSerifLabel()
            label.font = UIFont.sansSerifFontWithSize(12)
            view.addSubview(label)

            if key == "time" {
                clockClosure(label)
            } else {
                label.attributedText = dict.values.first!
            }

            view.constrainHeight("14")
            thumbnailView.alignTop("0", leading: "0", toView: view)
            label.alignBottom("0", trailing: "0", toView: view)
            thumbnailView.constrainTrailingSpaceToView(label, predicate:"-6")
            return view
        }

        views.forEach { button in
            self.addSubview(button)
            button.alignTopEdgeWithView(self, predicate: "0")
        }

        let first = views.first!
        let last = views.last!

        first.alignLeadingEdgeWithView(self, predicate: "0")
        last.alignTrailingEdgeWithView(self, predicate: "0")

        if views.count == 3 {
            let middle = views[1]
            middle.alignCenterXWithView(self, predicate: "0")
        }

        if views.count == 4 {
            let middleLeft = views[1]
            let middleRight = views[2]

            let spacerView = UIView()
            addSubview(spacerView)

            let spacerView2 = UIView()
            addSubview(spacerView2)

            let spacerView3 = UIView()
            addSubview(spacerView3)

            UIView.equalWidthForViews([spacerView, spacerView2, spacerView3])

            spacerView.alignAttribute(.Leading, toAttribute: .Trailing, ofView: first, predicate: "0")
            spacerView.alignAttribute(.Trailing, toAttribute: .Leading, ofView: middleLeft, predicate: "0")

            spacerView2.alignAttribute(.Leading, toAttribute: .Trailing, ofView: middleLeft, predicate: "0")
            spacerView2.alignAttribute(.Trailing, toAttribute: .Leading, ofView: middleRight, predicate: "0")
            
            spacerView3.alignAttribute(.Leading, toAttribute: .Trailing, ofView: middleRight, predicate: "0")
            spacerView3.alignAttribute(.Trailing, toAttribute: .Leading, ofView: last, predicate: "0")
        }
    }
}
