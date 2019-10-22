reduce-img is a cli tool for tinifing png or jpg file. It is base on [tinify png.](https://tinypng.com/) It decrease the number of colors in the image, so therd is fewer bytes to store data without almost no difference visually.

### how to use

The only thing required to start tinify your image is to get the [tinify key](https://tinypng.com/developers). You just need to submit your e-mail and then you will receive the key.

```
npm install -g reduce-img

// set the key
reduce-img -k yourkey

// compress all of png and jpg files in the current directory and then cover it
reduce-img

// compress specified files
reduce-img ./1.jpg,./img/2.png
```

The speeds of your tiny task depends on the speed of the network. when the task start, It upload the image to the server and then download the compressed image data.
