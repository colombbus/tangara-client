define(['TObject', 'utils/TUtils', 'TRuntime', 'TEnvironment'], function (TObject, TUtils, TRuntime, TEnvironment) {
    var Sound = function (name) {
        TObject.call(this, name);

        this.sounds = new Array();
        this.soundSets = new Array();
        this.loop = false;
        if (typeof name === 'string') {
            this._addSound(name);
        }
    };
    Sound.prototype = Object.create(TObject.prototype);
    Sound.prototype.constructor = Sound;
    Sound.prototype.className = "Sound";

    var qInstance = TRuntime.getQuintusInstance();

    Sound.prototype.qInstance = qInstance;

    Sound.prototype.qAudio = qInstance.audio;

    Sound.prototype.addSound = function (name, set, project) {
        name = TUtils.getString(name);
        var asset;
        // add sound only if not already added
        if (typeof this.sounds[name] === 'undefined') {
            try {
                if (project) {
                    // asset from project
                    asset = TEnvironment.getProjectResource(name);
                } else {
                    // asset from object itself
                    asset = this.getResource(name);
                }
                this.sounds[name] = asset;
                if (typeof set === 'undefined') {
                    set = "";
                } else {
                    set = TUtils.getString(set);
                }
                if (typeof this.soundSets[set] === 'undefined') {
                    this.soundSets[set] = new Array();
                }
                this.soundSets[set].push(name);
                var loadedAsset = asset;
                var qI = this.qInstance;
                this.qInstance.load(asset, function () {
                    var sound = qI.asset(loadedAsset);
                });
            }
            catch (e) {
                throw new Error(this.getMessage("file not found", name));
            }
        } else {
            asset = this.sounds[name];
        }
        return asset;
    };
    Sound.prototype._addSound = function (name, set) {
        this.addSound(name, set, true);
    };

    Sound.prototype._loop = function (state) {
        if (state)
            this.loop = true;
        else
            this.loop = false;
    };
    Sound.prototype._play = function (name) {
        var asset = this.sounds[name];
        // TODO: wait for loading
        this.qAudio.play(asset, {loop: this.loop});
    };
    Sound.prototype._stop = function (name) {
        var asset = this.sounds[name];
        this.qAudio.stop(asset);
    };
    TEnvironment.internationalize(Sound, true);
    return Sound;
});
