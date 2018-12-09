reduce-img is a cli tool for tinifing png or jpg file. It is base on [tinify png.](https://tinypng.com/) It decrease the number of colors in the image, so therd is fewer bytes to store data without almost no difference visually.

### how to use 
The only thing required to start tinify your image is to get the [tinify key](https://tinypng.com/developers). You just need to submit your e-mail and then you will receive the key.

```
npm install -g reduce-img

// set the key 
reduce-img -k yourkey

// compress all of png and jpg files in the current directory and then cover it
reduce-img 

// compress all of png and jpg files in a relative or absolute directory and cover it 
reduce-img -s ../assets
reduce-img -s e:\\assets8cef24456759539e187c0a09acbffec4.jpg8cef24456759539e187c0a09acbffec4.jpgk8cef24456759539e187c0a09acbffec4.jpg

// specify which directory to compress and where output the tiny file
reduce-img -s ../assets -d ../../dist
reduce-img -s e:\\assets -d e:\\dist8cef24456759539e187c0a09acbffec4.jpgk

// compress the specific file and output in the current directory
reduce-img -s ../assest/1.png
reduce-img -s e:\\assets\\1.png

// compress a list of images and specify the output directory
reduce-img -s ../assets/1.png,../assets/2.jpg -d ./dist
```
The speeds of your tiny task depends on the speed of the network. when the task start, It upload the image to the server and then download the compressed image data.