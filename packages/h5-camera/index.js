var CameraInit = (function(window, document, undefined) {
    function MyCamera(videoDom, canvasDom) {
        this.mediaOpts = {
            audio: false,
            video: true,
            video: { facingMode: "environment" } // 或者 "user"
            // video: { width: 1280, height: 720 }
            // video: { facingMode: { exact: "environment" } }// 或者 "user"
        }
        this.video = videoDom;
        this.canvas1 = canvasDom;
        this.context1 = this.canvas1.getContext('2d');
        this.mediaStreamTrack = null;
        this.checkEnvironment();
    }
    MyCamera.prototype = {
        checkEnvironment: function() {
            window.URL = (window.URL || window.webkitURL || window.mozURL || window.msURL);
            if (navigator.mediaDevices === undefined) {
                navigator.mediaDevices = {};
            }
            if (navigator.mediaDevices.getUserMedia === undefined) {
                navigator.mediaDevices.getUserMedia = function(constraints) {
                    var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
                    if (!getUserMedia) {
                        return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
                    }
                    return new Promise(function(resolve, reject) {
                        getUserMedia.call(navigator, constraints, resolve, reject);
                    });
                }
            }
        },
        // 回调
        successFunc: function(stream) {
            this.mediaStreamTrack = stream;
            this.video = document.querySelector('video');
            if ("srcObject" in this.video) {
                this.video.srcObject = stream
            } else {
                this.video.src = window.URL && window.URL.createObjectURL(stream) || stream
            }
            this.video.play();
        },
        errorFunc: function(err) {
            alert(err.name);
        },

        // 正式启动摄像头
        openMedia: function() {
            navigator.mediaDevices.getUserMedia(this.mediaOpts)
            .then(this.successFunc.bind(this))
            .catch(this.errorFunc.bind(this));
        },

        //关闭摄像头
        closeMedia: function() {
            var that = this;
            that.mediaStreamTrack.getVideoTracks().forEach(function(track) {
                track.stop();
                that.context1.clearRect(0, 0, that.context1.width, that.context1.height); //清除画布
            });
        },

        //截取视频并转为图片
        drawMediaAndToImg: function() {
            this.canvas1.setAttribute("width", this.video.videoWidth);
            this.canvas1.setAttribute("height", this.video.videoHeight);
            this.context1.drawImage(this.video, 0, 0, this.video.videoWidth, this.video.videoHeight); //显示在canvas中
            var image = new Image();
            image.src = this.canvas1.toDataURL('image/png')
            var imageWarp = document.getElementById("imageWarp");
            if (imageWarp.hasChildNodes()) {
                document.getElementById("imageWarp").replaceChild(image, imageWarp.firstChild);
            } else {
                document.getElementById("imageWarp").appendChild(image);
            }
        },
    };
    return MyCamera;
})(window, document);

export default CameraInit;