GULP CSS Sprite
===============

gulp-spriter（gulp css自动合并雪碧图）
---------------------------------------

来源：https://github.com/roninliu/gulp-spriter

### 转载修复
```
.pipe(spriter({
    sprite: "test.png",
    slice: "./src/slice",
    outpath: "./src/images/slice",
    imgPathFromCss: "../images", //新增
    isH5: true  //新增
  }))
```
#### `imgPathFromCss: "../images"`
增加了 生成CSS文件中雪碧图的路径可选择 的功能。
路径为 雪碧合成图导出文件夹相对于css文件的路径。

#### `imgPathFromCss: "isH5"`
判断是否是H5，若是，则将雪碧图的背景定位都除以2.（为了配合公司业务移动端原图是实际需要的2倍问题）

一般人使用`isH5`不填就好。
examples文件下中的实例是之前作者留下的。

### 简介
gulp-spriter：帮助前端工程师将css代码中的切片图片合并成雪碧图，支持retina图片。

### 功能
* 使用二叉树排列算法，对图片排序优化
* 自动收集css中带切片的图片（仅对background-image:url("slice/xx.png")有效）
* 自动在原来的css中添加background-position属性
* 支持生成适用于高清设备的雪碧图，并在css文件追加媒体查询css代码

### 依赖
gulp-spriter使用spritesmith作为图片生成的基础算法


### 安装
```
npm install gulp-spriter-ny
```

### 配置
导入gulp-spriter依赖：

```
var spriter = require("gulp-spriter-ny");

```

gulpfile配置文件中增加task，如下：
```
gulp.task("css",["clean"],function(){
  return gulp.src("./src/css/xxx.css")
         .pipe(spriter({
            sprite:"test.png",
            slice:"./src/slice",
            outpath:"./build/tests"
          }))
         .pipe(gulp.dest('./build/css'))
})
```

### 参数
* sprite:[string] 必须，设置输出的雪碧图名称
* slice：[string] 必须，切片文件存放位置，基于根目录
* outpath：[string] 必须，输出的雪碧图位置
* imgPathFromCss: [string] 必须，雪碧图相对于css的路径

### 实例
具体使用方式可以参考examples对应的实例

### change log
* 优化了引擎,取消了引擎的依赖过多的问题
* 优化了文件路径问题