[![CircleCI](https://circleci.com/gh/Microsoft/PowerBI-visuals-CardBrowser/tree/develop.svg?style=svg)](https://circleci.com/gh/Microsoft/PowerBI-visuals-CardBrowser/tree/develop)

# Card Browser
Browse documents using double-sided cards, and click to view in place.

Card Browser is a document set viewer featuring flippable, double-sided cards for natural navigation of media collections. 

The Preview face of each card renders the headline image, title, and origin of the story with a text sample, enabling rapid discovery of documents of interest.  Flipping the cards reveals the MetaData face, which lists document properties. Clicking on a card expands it in place for detailed reading.

![Alt text](assets/2-reader.png?raw=true "Card Browser Reader")

![Alt text](assets/3-metadata.png?raw=true "Card Browser Metadata")
# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Debugging

* Install ssl certificate by running `yarn run install-certificate` and following the steps from: [https://github.com/Microsoft/PowerBI-visuals/blob/master/tools/CertificateSetup.md](https://github.com/Microsoft/PowerBI-visuals/blob/master/tools/CertificateSetup.md)
* Enable Developer Tools in PowerBI: [https://github.com/Microsoft/PowerBI-visuals/blob/master/tools/DebugVisualSetup.md](https://github.com/Microsoft/PowerBI-visuals/blob/master/tools/DebugVisualSetup.md)
* Run `yarn start` to start development.

## Building

* Run `yarn run package` to package the visual.
* `.pbiviz` file will be generated in the `dist` folder

## Testing

* Run `yarn test`
