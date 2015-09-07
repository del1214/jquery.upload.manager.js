# jQuery.upload.manage
一个[jQuery-File-Upload](https://github.com/blueimp/jQuery-File-Upload "jQuery-File-Upload")管理器


## option


### view
拖拽区域id选择器

* Type:String
* Default:`'#rocoDndArea'`

### fileList
文件列表id选择器

* Type:String
* Default:`'#rocoFileList'`

### statusBar
全局状态条

* Type:String
* Default:`'#rocoStatusBar'`

### queueList
view和filelist的富div id选择器

* Type:String
* Default:`'#rocoQueueList'`

### autoUpload
是否自动上传

* Type:Boolean
* Default:`true`

### limitMultiFileUploadSize
单个文件最大上传容量，单位为byte

* Type:Number
* Default:`2048000`

### limitMultiFileNumber
最大上传数量

* Type:Number
* Default:5

### acceptFileTypes
上传文件类型

* Type:Regx
* Default:`/(\.|\/)(gif|jpe?g|png)$/i`

##Api

###init
初始化

`var uploader = $('#uploader').uploadManage(options)`


### add
添加图片，对应[jQuery-File-Upload](https://github.com/blueimp/jQuery-File-Upload "jQuery-File-Upload")`add`回调

参数 

* data
`uploader.uploadManage('add',data)`

### done
上传完成，对应[jQuery-File-Upload](https://github.com/blueimp/jQuery-File-Upload "jQuery-File-Upload")`done`回调
参数

* file
`uploader.uploadManage('done',data.files[0], data.result.data)`

### progress
单个文件上传进度，对应[jQuery-File-Upload](https://github.com/blueimp/jQuery-File-Upload "jQuery-File-Upload")`progress`回调
参数

* progress:Number
* file

`var progress = parseInt(data.loaded / data.total * 100, 10);`
`uploader.uploadManage('progress', progress, data.files[0]);`

### check
文件检查
参数

* data
返回值 Boolean

`uploader.uploadManage('check', data)`

### numberCheck

数量检查
参数

* hasError:String
* data
返回值 Boolean

`uploader.uploadManage('numberCheck', false, data);`

### size
获得上传图片数量
返回值 Number

`uploader.uploadManage('size');`

### getUploads
获得上传图片路径
返回值 Array

`uploader.uploadManage('getUploads');`

### retry
显示对应图片重试按钮
参数 

* data
返回值 无

`uploader.uploadManage('retry',data)`

# 完整Demo

```
$(function() {

    // 局部支持拖拽上传需添加此代码
    $(document).bind('drop dragover', function(e) {
        e.preventDefault();
    });

    // ajax 配置
    var ajaxOptions = {
        url: '/api/upload/image',
        type: 'POST',
        dataType: 'json',
        // 表单参数
        formData: {
            // 指定上传类型
            imageType: 'PRODUCT'
        }
    };

    // 文件配置
    var fileOptions = {
        multiple: false, //禁用多文件上传
        dropZone: '#rocoDndArea', //支持拖拽上传
        limitMultiFileUploadSize: 2048000, //单个文件最大上传容量，单位为byte
        limitMultiFileNumber: 5,
        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i, //允许上传文件类型
        sequentialUploads: true,
        autoUpload: true, //不自动上传
    };
    // 事件配置
    var eventOptions = {
        // 添加事件
        add: function(e, data) {
            if (uploadManage.uploadManage('check', data)) {
                // 有错误返回
                return false;
            } else {
                // 没错误提交
                uploadManage.uploadManage('add', data);
                // 自动上传
                fileOptions.autoUpload && data.submit();
            }
        },
        // 拖拽完成
        drop: function(e, data) {
            return !uploadManage.uploadManage('numberCheck', false, data);
        },
        // 提交开始
        submit: function(e, data) {
            window.console && console.log('submit');
        },
        // 传送开始
        send: function(e, data) {
            window.console && console.log('send');
        },
        start: function(e) {
            window.console && console.log('Uploads started');
        },
        stop: function(e) {
            window.console && console.log('Uploads finished');
        },
        change: function(e, data) {
            $.each(data.files, function(index, file) {
                window.console && console.log('Selected file: ' + file.name);
            });
        },
        // 上传完成
        done: function(e, data) {
            window.console && console.log('done');
            if (data.result.code == 1) {
                uploadManage.uploadManage('done', data.files[0], data.result.data);
            }
        },
        // 上传进度
        progress: function(e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            uploadManage.uploadManage('progress', progress, data.files[0]);
        },
        progressall: function(e, data) {
            window.console && console.log('progressall');
            // var progress = parseInt(data.loaded / data.total * 100, 10);
        },
        // 上传失败
        fail: function(e, data) {
            window.console && console.log('failed');
        },
        always: function(e, data) {

        }
    };
    // 混合几个option
    var options = $.extend({}, ajaxOptions, fileOptions, eventOptions);
    // 开启上传空间
    $('#rocoFileUpload').fileupload(options);
    // 开启上传代理
    uploadManage = $('#uploader').uploadManage({
        limitMultiFileUploadSize: fileOptions.limitMultiFileUploadSize,
        limitMultiFileNumber: fileOptions.limitMultiFileNumber,
        acceptFileTypes: fileOptions.acceptFileTypes,
        autoUpload: fileOptions.autoUpload
    });
});
```



