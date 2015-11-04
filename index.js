'use strict';
/**
 * [gulp-spriter 雪碧图工具]
 * @param  {[object]} opt [自定义参数]
 * opt = {
 *     outname:"sprite.png",
 *     inpath:"./src/slice",
 *     outpath:"./build/sprite"
 * }
 */
var PLUGIN_NAME = "gulp-spriter";
var through = require('through2');
var gutil = require('gulp-util');
var fs = require('fs-extra');
var spritesmith = require('spritesmith');
var fileExists = require('file-exists');


module.exports = function(opt){
    /**
     * [默认参数：必须]
     * sprite:输入生成雪碧图文件名
     * slice：输入的切片文件位置
     * outpath：输出雪碧图存放位置
     */
    var _outSpriteName = opt.sprite;
    var _inSlicePath = opt.slice;
    var _outSpritePath = opt.outpath;
    var _rootPath = _inSlicePath.slice(0,_inSlicePath.lastIndexOf("/"));

    /**
     * [_getSpritesmithConfig 获取spritesmith的配置]
     * @param  {[array]} imagePath [相对路径的图片数组]
     * @return {[object]}          [spritesmith的配置]
     */
    var _getSpritesmithConfig = function(imagePath){
        var _config = {
            src:imagePath,
            engine:"pixelsmith",
            format:"png",
            algorithm:"binary-tree"
        }
        return _config;
    }

    /**
     * [_getSliceObjectHandler 根据CSS文件获取图片列表和对应的样式文件]
     * @param  {[string]} filestring [转换为string的css文件buffer]
     * @return {[object]}            [返回object{img:[],list:[]}]
     */
    var _getSliceObjectHandler = function(filestring){
        var _sliceObject;
        var _regex = new RegExp('background-image:[\\s]*url\\(["\']?(?!http[s]?|/)[^;]*?(slice[\\w\\d\\s!./\\-\\_@]*\\.[\\w?#]+)["\']?\\)[^;}]*;?', 'ig');
        var _sliceCodeList = filestring.match(_regex);
        var _pathToResource;
        var _sliceImgUrlList = [];
        var _sliceList = [];
        if(_sliceCodeList !== null){
            for(var x=0;x<_sliceCodeList.length;x++){
                _pathToResource = _sliceCodeList[x].replace(_regex,"$1");
                _sliceImgUrlList[x] = _pathToResource;
                _sliceList[_pathToResource] =  _sliceCodeList[x];
            }
        }
        _sliceObject = {
            img:_sliceImgUrlList,
            list:_sliceList
        }
        return _sliceObject;
    }

    /**
     * [_getSliceImagePathHandler 根据css中获得的切片图片获取图片对应的相对路径]
     * @param  {[array]} sliceList [css文件中得到slice图片数组]
     * @return {[array]}           [返回相对路径的图片数组]
     */
    var _getSliceImagePathHandler = function(sliceList){
        var _sliceImgPathUrl = [];
        if(sliceList.length > 0){
            for(var y=0;y<sliceList.length;y++){
                _sliceImgPathUrl[y] = _rootPath+"/"+ sliceList[y];
            }
        }
        return _sliceImgPathUrl;
    }
    /**
     * [_createSpriteHandler 创建雪碧图]
     * @param  {[type]}   config   [spritesmith的配置]
     * @param  {Function} callback [创建图片成功后调用函数，用于update样式]
     * @return {[void]}            [无]
     */
    var _createSpriteHandler = function(config,callback){
        spritesmith(config,function(error,result){
            if(error){
                gutil.log("[Error]",new gutil.PluginError(PLUGIN_NAME, error))
            }else{
                if(callback !== undefined){
                    var _resultPosition = result.coordinates;
                    fs.writeFileSync(_outSpriteName,result.image,"binary");
                    fs.move(_outSpriteName,_outSpritePath +"/"+ _outSpriteName,{clobber: true},function(err){
                        if(err){
                            gutil.log(gutil.colors.red("[Error]"),new gutil.PluginError(PLUGIN_NAME, err))
                        }else{
                            gutil.log(gutil.colors.green("[Successful]"),gutil.colors.yellow("[Done]:"+ _outSpriteName +" Create Successful"))
                        }
                    });
                    callback(_resultPosition);
                }else{
                    gutil.log("[Error] Create Sprite callback is required!");
                }
            }
        })
    }
    /**
     * [_updateStyleHandler 更新样式表string]
     * @param  {[array]} sliceCode [合并后图片所在的位置以及对应的样式代码]
     * @param  {[type]} data      [原css文件转换string的对象]
     * @return {[type]}           [返回更新后的样式文件string]
     */
    var _updateStyleHandler = function(sliceCode,data){
    	console.log(_outSpritePath);
        var _slice;
        for(var key in sliceCode){
            _slice = sliceCode[key];
            var _code = "background-image: url(.";
                _code += _outSpritePath.slice(_outSpritePath.lastIndexOf("/"),_outSpritePath.length);
                _code += "/";
                _code += _outSpriteName;
                _code += ");";
                _code += "background-position: -";
                _code += _slice.x;
                _code += "px -";
                _code += _slice.y;
                _code += "px;";
            data = data.replace(_slice.code,_code);
        }
        return data;
    }
    /**
     * [_getRetinaClassSliceHandler 获取retina的图片和对应的class]
     * @param  {[string]} data [样式文件转换为string流的数据]
     * @return {[object]}      [返回retina图片数组和class数组]
     */
    var _getRetinaClassSliceHandler = function(data){
        var _retinaObject;
        var _data = [];
        var _retinaImageList = [];
        var _retinaSliceList =[];
        var _regex = new RegExp('background-image:[\\s]*url\\(["\']?(?!http[s]?|/)[^;]*?(slice[\\w\\d\\s!./\\-\\_@]*\\.[\\w?#]+)["\']?\\)[^;}]*;?', 'ig');
        var _rregex = new RegExp('.*(slice\\/[\\w\\d\\s!./\\-\\_@]*)\\.([\\w?#]+)["\']?\\)[^;}]*;?', 'ig');
        RegExp.escape = function (s) {
            return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
        };
        _data = data.match(_regex);
        if(_data !== null){
            for(var i=0;i<_data.length;i++){
                var _slice = _data[i];
                var _retinaSlice = _slice.replace(_rregex,"$1")+"@2x."+_slice.replace(_rregex,"$2");
                var _retinaSlicePath = _rootPath +"/"+_retinaSlice;
                if(fileExists(_retinaSlicePath)){
                    var _regexClassNameString = '(\\.?[^}]*?)\\s?{\\s?[^}]*?' + RegExp.escape(_slice);
                    var _regexClassName = new RegExp(_regexClassNameString, 'ig');
                    var _classNameResult = data.match(_regexClassName);
                    var _className = _classNameResult[0].replace(_regexClassName, '$1');
                    var _retinaItem = new Object();
                    _retinaImageList.push(_retinaSlicePath);
                    _retinaItem.className = _className;
                    _retinaSliceList[_retinaSlicePath] = _retinaItem;
                }
            }
        }
        _retinaObject = {
            slice:_retinaImageList,
            slicekey:_retinaSliceList
        }
        return _retinaObject;
    }
    /**
     * [_createRetinaSpriteHandler 创建retina雪碧图]
     * @param  {[object]}   config   [spritesmith的配置]
     * @param  {Function} callback [图片创建成功返回值]
     * @return {[void]}            [无]
     */
    var _createRetinaSpriteHandler = function(config,callback){
        spritesmith(config,function(error,result){
            if(error){
                 gutil.log("[Error]",new gutil.PluginError(PLUGIN_NAME, error))
            }else{
                if(callback !== undefined){
                    var _retinaSprite = _outSpriteName.replace(".png","@2x.png");
                    fs.writeFileSync(_retinaSprite,result.image,"binary");
                    fs.move(_retinaSprite,_outSpritePath+"/"+_retinaSprite,{clobber: true},function(err){
                        if(err){
                            gutil.log(gutil.colors.red("[Error]"),new gutil.PluginError(PLUGIN_NAME, err))
                        }else{
                            gutil.log(gutil.colors.green("[Successful]"),gutil.colors.yellow("[Done]:"+ _retinaSprite +" Create Successful"));
                        }
                    })
                    callback(result);
                }else{
                    gutil.log(gutil.colors.red("[Error] Create Retina Sprite callback is required!"));
                }
            }
        })
    }
    /**
     * [_updateRetinaStyleHandler 更新retina样式支持]
     * @param  {[string]} css          [增加过的普通雪碧图的样式]
     * @param  {[object]} retinaobject [retina相关的样式雪碧图]
     * @param  {[object]} properties   [雪碧图的信息]
     * @return {[string]}              [返回增加后的样式]
     */
    var _updateRetinaStyleHandler = function(css,retinaobject,properties){
        var _tmpSlice = retinaobject.slicekey;
        var _retinaCSSCode = "";
        var _sprite ;
            _retinaCSSCode +='\n\n@media only screen and (-webkit-min-device-pixel-ratio: 1.5),only screen and (min--moz-device-pixel-ratio: 1.5),only screen and (min-resolution: 240dpi){';
            for(var key in _tmpSlice){
                _sprite = _tmpSlice[key].code;
                _retinaCSSCode += _tmpSlice[key].className;
                _retinaCSSCode += "{background-image:url(.";
                _retinaCSSCode += _outSpritePath.slice(_outSpritePath.lastIndexOf("/"),_outSpritePath.length);
                _retinaCSSCode += "/";
                _retinaCSSCode += _outSpriteName.replace(".png","@2x.png")+");";
                _retinaCSSCode += "background-position: -";
                _retinaCSSCode += (_sprite.x) / 2;
                _retinaCSSCode += "px -";
                _retinaCSSCode += (_sprite.y) / 2;
                _retinaCSSCode += "px;background-size:";
                _retinaCSSCode += (properties.width) / 2 + 'px;}';
            }
            _retinaCSSCode += '\n}\n';
        css = css + _retinaCSSCode;
        return css;
    }
    /**
     * 插件具体干事情的在这里
     */
    return through.obj(function(file, encoding, cb){
        if (file.isNull()) {
            this.push(file);
            return cb();
        }
        if (file.isStream()) {
            this.emit("[Error]",new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'))
            return cb();
        }
        var _that = this;
        var _cssString;
        var _retinaCSSString;
        var _sliceObject = _getSliceObjectHandler(String(file.contents));
      
        var _sliceImagePath = _getSliceImagePathHandler(_sliceObject.img);
        var _config =_getSpritesmithConfig(_sliceImagePath);
        _createSpriteHandler(_config,function(position){
            var _sliceCode = [];
            for(var key in position){
                var newKey = key;
                if(_rootPath != "./"){
                    newKey = key.replace(_rootPath + "/","");
                }
                _sliceCode[newKey] = position[key];
                _sliceCode[newKey].code = _sliceObject.list[newKey];
            }
            _cssString = _updateStyleHandler(_sliceCode,String(file.contents));
            //console.log(_cssString);
            var _retinaObject =_getRetinaClassSliceHandler(String(file.contents));
            if(_retinaObject.slice.length > 0){
                 var _retinaConfig = _getSpritesmithConfig(_retinaObject.slice);
                 _createRetinaSpriteHandler(_retinaConfig,function(result){
                    var _spriteProperties = result.properties;
                    if(_spriteProperties.width % 2 == 1){
                        gutil.log("[Error] : @2x slice image size must be even number, Please check it!");
                    }else{
                        for(var key in result.coordinates){
                            _retinaObject.slicekey[key].code = result.coordinates[key];
                        }
                    }
                    _retinaCSSString = _updateRetinaStyleHandler(_cssString,_retinaObject,_spriteProperties);
                    //console.log(_retinaCSSString);
                    file.contents = new Buffer(_retinaCSSString);
                    _that.push(file);
                    cb();
                })
            }else{
                file.contents = new Buffer(_cssString);
                _that.push(file);
                cb();
            }
        });
    });
};