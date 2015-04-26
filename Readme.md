# Crazy Circles
 
Crazy Circles is a visual illusion which happens when different balls bouncing inside of a circle create the impression of a circular movement, where in reality, the movement of each ball is straight.

The CrazyCircles javascript class allows you to easily add this nice visual effect to your loading...'s page.
 
## Index
 
* [Usage](#usage)
* [Options](#options)
* [Implementation and Examples](#implementation-and-examples)
* [Dependencies](#dependencies)
 
## Usage
 
To render the crazy circles, you need a container (i.e.: div). On the class intantiation, you pass the id of your container and optionally your options configuration.

**HTML**

```html

<div id="cc"></div>

```

**Script**

```javascript

new CrazyCircles("cc", {} );

```
 
## Options

Following options are allowed:

 * **backgroundColor** - An HTML color for the container background.
 * **circleSize** - The diameter of each circle. If zero calculates it automatically
 * **color** - An HTML color code to be used by the circles. "multi" for having multiple rainbow colors.
 * **cycleDuration** - Cycle in milliseconds for a complete spin (ohhh, isn't the spinning just an illusion?)
 * **fadeIn** - When true, the circles will appear progressively
 * **goCrazyCycle** - Number of cycles for the balls to go completely crazy. 0 = never
 * **goCrazyOnClick** - When clicking on a circle, it goes crazy
 * **image** - Replaces the balls by an image from the url
 * **imageHeight** - Image height (when using an image)
 * **imageWidth** - Image width (when using an image)
 * **path** - Replaces the balls by an svg path
 * **restartAfterCycle** - Restarts after x cycles. Only relevant when using fadeIn or goCrazyCycle
 * **size** - The container size. If null or 0 uses the current container size.
 * **shadow** - Adds a shadow for each circle to give a movement effect. Doesn't work for images
 * **totalCircles** - The number of circles for the illusion. Minimum 1 (which is pretty stupid)	

**Example**

```javascript
new CrazyCircles(
  "ccGoCrazy", 
  { color: "multi", 
    goCrazyCycle: 5, 
    restartAfterCycle: 10 
  } );	
```
	

## Implementation and Examples

To read more about how the effect was implemented and to see some examples, please check the blog article:

<http://www.kopf.com.br/kaplof/crazy-circles-loading-using-javascript>

## Dependencies

Crazy Circles requires Raphael.js

