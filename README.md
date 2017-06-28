# timeline.js
A JavaScript library based on [D3.js](https://d3js.org/) and packed with [Webpack](https://webpack.js.org/), with draggable visualization thumbnail window and updated data visualization.

## Timeline Components
This timeline contains four parts: data-display area, mask, mask-controllers and mask-background. Among these four parts, mask-background is static with fixed width and height; data-display area is the rectangular clip path on top of mask-background, with alterable patterns according to different data-input; mask is the light blue translucent sliding block on mask-background which can shrink or extend to users’ input respectively; mask-controllers are the two tiny handlers placed on the left and right of mask, which can be pulled by users.

## How to use
1. Download this library to your project.
2. Include timeline.js into your project.
3. Create a div element in html.
4. In your .js file, create a timeline object e.g., timelineObj, and pass div's DOM to timelineObj.
5. call timelineObj.draw(your data).

## How to contribute
You are welcome to contribute😃! you can add any .css files you like under /src to customize your own timeline, and don’t forget to modify package.json and include related loaders in wepack.config.js.
What’s more, in order to distinguish different activities, you can choose colors randomly using D3’s colormap and set activity’s stroke color attribute in index.js under /src.
