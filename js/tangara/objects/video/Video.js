define(['jquery', 'TObject', 'TUtils', 'TRuntime', 'TEnvironment', 'TCanvas'], function ($, TObject, TUtils, TRuntime, TEnvironment, TCanvas) {
    var Video = function (name) {
        TObject.call(this, name);



        //$("video").attr("type", "video/mp4");
        $("video").append('<source src="http://localhost/tangara-client/images/minions.mp4" type="video/mp4" style="width: 500px; height: 500px;"></source>');

        //$("video").attr("src", TUtils.getString("minions.mp4"));
        //"assets/minions.mp4"



        this.video = new Array();
        this.videoSets = new Array();
        this.loop = false;
        if (typeof name === 'string') {
            this._addVideo(name);
        }
    };
    Video.prototype = Object.create(TObject.prototype);
    Video.prototype.constructor = Video;
    Video.prototype.className = "Video";

    //var tInstance = new Tracking();
    var tInstance = new Object();
    Video.prototype.qInstance = tInstance;




    Video.prototype.qAudio = tInstance.audio;

    Video.prototype.addSound = function (name, set, project) {
        name = TUtils.getString(name);
        var asset;
        // add sound only if not already added
        if (typeof this.video[name] === 'undefined') {
            try {
                if (project) {
                    // asset from project
                    asset = TEnvironment.getProjectResource(name);
                } else {
                    // asset from object itself
                    asset = this.getResource(name);
                }
                this.video[name] = asset;
                if (typeof set === 'undefined') {
                    set = "";
                } else {
                    set = TUtils.getString(set);
                }
                if (typeof this.videoSets[set] === 'undefined') {
                    this.videoSets[set] = new Array();
                }
                this.videoSets[set].push(name);
                var loadedAsset = asset;
                var qI = this.qInstance;
                this.qInstance.load(asset, function () {
                    var video = qI.asset(loadedAsset);
                });
            }
            catch (e) {
                throw new Error(this.getMessage("file not found", name));
            }
        } else {
            asset = this.video[name];
        }
        return asset;
    };
    Video.prototype._addVideo = function (name, set) {
        this.addSound(name, set, true);
    };

    Video.prototype._loop = function (state) {
        if (state)
            this.loop = true;
        else
            this.loop = false;
    };
    Video.prototype._play = function (name) {
        var asset = this.video[name];
        // TODO: wait for loading
        this.qAudio.play(asset, {loop: this.loop});
    };
    Video.prototype._stop = function (name) {
        var asset = this.video[name];
        this.qAudio.stop(asset);
    };
    TEnvironment.internationalize(Video, true);
    return Video;
});
