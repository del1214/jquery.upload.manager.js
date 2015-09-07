;
(function($) {
    'use strict';
    // 插件实例
    var plugin = null;

    // 定义类
    function UploadManage() {
        this.view = null;
        this.fileList = null;
        this.options = {
            view: '#rocoDndArea', //拖拽区域
            fileList: '#rocoFileList', //文件列表
            statusBar: '#rocoStatusBar', //全局状态条
            queueList: '#rocoQueueList', //总体范围
            autoUpload: true, //是否自动上传
            limitMultiFileUploadSize: 2048000, //单个文件最大上传容量，单位为byte
            limitMultiFileNumber: 5, //限制上传数量
            acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i, //允许上传文件类型
        };
        // 模板
        this.template = function(file) {
            var fragment = '';
            fragment += '<div id="' + file.id + '" class="thumbnail">';
            fragment += '<p class="title">' + file.name + '</p>';
            fragment += '<p class="imgWrap">';
            fragment += '<img src="" style="display:none;">';
            fragment += '</p>';
            fragment += '<p class="progress"><span></span></p>';
            fragment += '<div class="file-panel">';
            fragment += '<i data-handle="remove_arrow_click" class="fa fa-times" title="删除" alt="删除"></i>';
            fragment += '<i data-handle="down_arrow_click" class="fa fa-arrow-down" title="下移" alt="下移"></i>';
            fragment += '<i data-handle="up_arrow_click" class="fa fa-arrow-up" title="上移" alt="上移"></i>';
            fragment += this.options.autoUpload ? '' : '<i data-handle="upload_click" class="fa fa-play" title="上传" alt="上传"></i>';
            fragment += '</div>';
            fragment += '</div>';
            return fragment;
        };
        // id索引
        this.idIndex = 0;
        this.imgNumber = 0;
    };

    // 扩展方法到prototype
    $.extend(UploadManage.prototype, {
        _init: function(target, _options) {
            $.extend(this.options, _options || {});
            this._bindEvent();
        },
        // 绑定事件
        _bindEvent: function() {
            var self = this;
            var _$fileList = $(this.options.fileList);
            // 解除掉所有click方法
            _$fileList.off('click');

            // 上移
            _$fileList.on('click', '[data-handle="up_arrow_click"]', function(event) {
                var _$item = $(this).parents('.thumbnail');
                _$item.insertBefore(_$item.prev());
                self._decorateItem();
                event.stopPropagation();
            });

            // 下移
            _$fileList.on('click', '[data-handle="down_arrow_click"]', function(event) {
                var _$item = $(this).parents('.thumbnail');
                _$item.insertAfter(_$item.next());
                self._decorateItem();
                event.stopPropagation();
            });

            // 删除
            _$fileList.on('click', '[data-handle="remove_arrow_click"]', function(event) {
                var _$item = $(this).parents('.thumbnail');
                _$item.remove();
                self._decorateItem();
                self._size();
                event.stopPropagation();
            });
        },
        _dataBindEvent: function($item, data) {
            $item.on('click', '[data-handle="upload_click"]', function(event) {
                $(this).hide();
                data.submit();
            });
        },
        // 装饰
        _decorateItem: function() {
            var imgItems = $(this.options.fileList).find('.thumbnail');
            var length = imgItems.length;
            (length >= 0) && imgItems.each(function(index, element) {
                var _item = $(element);
                if ((index + 1) == 1) {
                    _item.find('[data-handle="up_arrow_click"]').hide();
                } else {
                    _item.find('[data-handle="up_arrow_click"]').show();
                }
                if ((index + 1) == length) {
                    _item.find('[data-handle="down_arrow_click"]').hide();
                } else {
                    _item.find('[data-handle="down_arrow_click"]').show();
                }
            });
        },
        // 进度条
        progress: function(progress, file) {
            $('#' + file.id).find('.progress span').animate({
                width: progress + '%'
            }, 500, function() {
                var _this = this;
                setTimeout(function() {
                    $(_this).hide();
                }, 2000);
            });
            return this;
        },
        // 个数
        size: function() {
            return this.imgNumber;
        },
        // 修正imgNumber
        _size: function() {
            this.imgNumber = $(this.options.fileList).find('.thumbnail').length;
        },
        // 添加
        add: function(data) {
            var file = data.files[0];
            // 创建id
            file.id = new Date().getTime() + '_' + this.idIndex++;
            // 插入dom
            var _$imgItem = $(this.template(file)).insertBefore($(this.options.view));
            // 不自动上传的绑定手动事件
            if (!this.options.autoUpload) {
                this._dataBindEvent(_$imgItem, data);
            }
            this._decorateItem();
            this.imgNumber++;
            return this;
        },
        // 上传完成
        done: function(file, res) {
            $('#' + file.id).find('img').attr('src', res.fullPath).css('display', 'block');
            return this;
        },
        // 检查
        check: function(data) {
            var self = this;
            var hasError = false; //是否有错误发生
            // 遍历文件
            $.each(data.files, function(index, file) {
                // 检查文件类型
                if (!self.options.acceptFileTypes.test(file.type)) {
                    toastr.warning(file.name + '属于不支持的文件类型');
                    hasError = true;
                }
                // 检查文件大小
                if (file.size > self.options.limitMultiFileUploadSize) {
                    toastr.warning(file.name + '容量超过', parseInt(self.options.limitMultiFileUploadSize / 1024 / 1024) + 'MB');
                    hasError = true;
                }
                // 不支持html5 api的只能检查文件名
            });

            // 检查上传个数
            hasError = self.numberCheck(hasError, data);
            return hasError;
        },
        // 数量检查
        numberCheck: function(hasError, data) {
            if ((this.imgNumber > this.options.limitMultiFileNumber) ||
                (this.imgNumber + data.files.length > this.options.limitMultiFileNumber)) {
                toastr.warning('上传文件不能超过' + this.options.limitMultiFileNumber + '个');
                hasError = true;
            }
            return hasError;
        }
    });

    // 定义jQuery插件名
    $.fn.uploadManage = function(_options) {
        // 先取出其他参数，如果有的话
        var otherArgs = Array.prototype.slice.call(arguments, 1);
        // string类型表示要做其他操作
        if (typeof _options === 'string') {
            if (!plugin[_options] || _options.charAt(0) === '_') {
                throw '未知的方法:' + _options;
            }
            // 将dom和对应剩余参数传入
            return plugin[_options].apply(plugin, otherArgs);
        } else {
            // 重新初始化对象
            plugin = new UploadManage();
            // 返回jQuery链式对象
            return this.each(function(index, element) {
                // 初始化方法
                plugin._init(element, _options || {});
            });
        }

    }
})(this.jQuery);