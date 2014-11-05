'use strict';
/**
 * [gulp-spriter 雪碧图工具]
 * @param  {[object]} opt [自定义参数]
 */
var PLUGIN_NAME = "gulp-spriter";
var through = require('through2');
var gutil = require('gulp-util');
var fs = require('fs-extra');
var spritesmith = require('spritesmith');
var fileExists = require('file-exists')


module.exports = function(opt){
    var opts = opt||{};
    return through.obj(function(file, encoding, cb){
        if (file.isNull()) {
            this.push(file);
            return cb();
        }
        if (file.isStream()) {
            this.emit("[Error]",new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'))
            return cb();
        }

        var _sliceCodeList = [],
            _sliceImgUrlList = [],
            _sliceCode = [],
            _sliceList = [],
            _that = this;

        var _regex = new RegExp('background-image:[\\s]*url\\(["\']?(?!http[s]?|/)[^;]*?(slice[\\w\\d\\s!./\\-\\_@]*\\.[\\w?#]+)["\']?\\)[^;}]*;?', 'ig');
        var _data = file.contents.toString()
        var _sliceCodeList = _data.match(_regex);
        var _pathToResource;

        if(_sliceCodeList !== null){
            for(var x=0;x<_sliceCodeList.length;x++){
                _pathToResource = _sliceCodeList[x].replace(_regex,"$1");
                _sliceImgUrlList[x] = _pathToResource;
                _sliceList[_pathToResource] =  _sliceCodeList[x];
            }
        }
        if(_sliceImgUrlList.length > 0){
            for(var y=0;y<_sliceImgUrlList.length;y++){
                _sliceImgUrlList[y] = opts.inSpritePath + _sliceImgUrlList[y].slice(_sliceImgUrlList[y].indexOf("/"));
            }
        }



        var _options = {
            "src":_sliceImgUrlList,
            "engine":"gm",
            'format': 'png',
            'algorithm': 'binary-tree'
        }
        spritesmith(_options,function(error,result){
            var _resultPosition = result.coordinates;
            //console.log(_resultPosition);
            fs.writeFileSync(opts.spriteName,result.image,"binary");
            fs.move("./"+opts.spriteName,opts.outSpritePath+"/"+opts.spriteName,function(err){
                if(err){
                    _that.emit("[Error]",new gutil.PluginError(PLUGIN_NAME, err))
                    return cb();
                }
            })
            for(var key in _resultPosition){
                var newKey = key;
                if(opts.inSpritePath != "./"){
                    newKey = key.slice(opts.inSpritePath.lastIndexOf("/")+1,key.length);
                }
                _sliceCode[newKey] = _resultPosition[key];
                _sliceCode[newKey].sprite = _sliceList[newKey];
            }
            replaceCSSCode();
            //console.log(_sliceList);
            //console.log(_sliceCode);
        })
        var replaceCSSCode = function(){
            var _slice;
            for(var key in _sliceCode){
                _slice = _sliceCode[key];
                var _code = "background-image: url(.." + opts.outSpritePath.slice(opts.outSpritePath.lastIndexOf("/"),opts.outSpritePath.length) +"/"+ opts.spriteName+");";
                _code += "background-position: -"+ _slice.x + "px -" + _slice.y + "px;";
                _data = _data.replace(_slice.sprite,_code);
            }
            createRetinaSprite();
        }
        var createRetinaSprite = function(){
            var _source = file.contents.toString();
            var _retinaImgList = [],
                _retinaSliceList = [],
                _retinaCode =[];

            //console.log(_source);
            var regex = new RegExp('.*(slice\\/[\\w\\d\\s!./\\-\\_@]*)\\.([\\w?#]+)["\']?\\)[^;}]*;?', 'ig');
            //var regex = new RegExp('.*slice\\/(.*)\\.(\\w*)', 'ig');
            RegExp.escape = function (s) {
                return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
            };
            for(var i=0;i<_sliceCodeList.length;i++){
                var _key = _sliceCodeList[i];
                var retinaIcon = _key.replace(regex,"$1")+"@2x."+_key.replace(regex,"$2");
                var retinaIconPath = opts.inSpritePath + retinaIcon.slice(retinaIcon.indexOf("/"),retinaIcon.length);
                //console.log(retinaIconPath);
                if(fileExists(retinaIconPath)){
                    var regexClassNameString = '(\\.?[^}]*?)\\s?{\\s?[^}]*?' + RegExp.escape(_key);
                    var regexClassName = new RegExp(regexClassNameString, 'ig');
                    var classNameResult = _source.match(regexClassName);
                    var className = classNameResult[0].replace(regexClassName, '$1');
                    var retinaItem = new Object();
                    _retinaImgList.push(retinaIconPath);
                    retinaItem.className = className;
                    _retinaSliceList[retinaIconPath] = retinaItem;
                }
            }
            if(_retinaImgList.length >0){
                 var _retinaOptions = {
                    "src":_retinaImgList,
                    "engine":"gm",
                    'format': 'png',
                    'algorithm': 'binary-tree'
                }
                spritesmith(_retinaOptions,function(err,result){
                    var _resultPosition = result.coordinates;
                    var _resutlProperties = result.properties;
                    //console.log(_resutlProperties);
                    var _spriteRetina =opts.spriteName.slice(opts.spriteName.indexOf("."),opts.spriteName.length)+"@2x.png";
                    fs.writeFileSync(_spriteRetina,result.image,"binary");
                    fs.move("./"+_spriteRetina,opts.outSpritePath+"/"+_spriteRetina,function(err){
                        if(err){
                            _that.emit("[Error]",new gutil.PluginError(PLUGIN_NAME, err))
                            return cb();
                        }
                    })
                    for(var key in _resultPosition){
                       _retinaSliceList[key].sprite = _resultPosition[key];
                    }
                    console.log(_retinaSliceList);
                    createRetinaCode(_retinaSliceList,_resutlProperties);
                })
            }
            
           
        }
        var createRetinaCode = function(list,properties){
            var _retinaCSSCode = "";
            var img ;
            _retinaCSSCode +='\n\n@media only screen and (-webkit-min-device-pixel-ratio: 1.5),only screen and (min--moz-device-pixel-ratio: 1.5),only screen and (min-resolution: 240dpi) \n{';
            for(var key in list){
                img = list[key].sprite;
                _retinaCSSCode += list[key].className;
                _retinaCSSCode += '{background-image:url(../'+opts.spriteName.slice(opts.spriteName.indexOf("."),opts.spriteName.length)+"@2x.png"+");";
                _retinaCSSCode +='background-position: -' + (img.x) / 2 + 'px -' + (img.y) / 2 + 'px;background-size:' + (properties.width) / 2 + 'px;}';
            }
            _retinaCSSCode += '\n}\n';
            var files = _data + _retinaCSSCode;
             console.log(files);
            file.contents = new Buffer(files);
           
            _that.push(file);
            cb(); 
        }
        
    });
};