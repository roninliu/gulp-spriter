GULP CSS Sprite
===============

gulp-spriter（gulp css自动合并雪碧图）
---------------------------------------

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
npm install gulp-spriter
```

### 配置
导入gulp-spriter依赖：

```
var spriter = require("gulp-spriter");

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


### 实例
具体使用方式可以参考examples对应的实例

### change log
* 优化了引擎,取消了引擎的依赖过多的问题
* 优化了文件路径问题