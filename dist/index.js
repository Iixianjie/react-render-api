'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var ReactDom = _interopDefault(require('react-dom'));
var utils = require('@lxjx/utils');

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
    return;
  }

  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

function createRenderApi(Component) {
  var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var Wrap = option.wrap,
      _option$maxInstance = option.maxInstance,
      maxInstance = _option$maxInstance === void 0 ? Infinity : _option$maxInstance,
      namespace = option.namespace;
  /** 返回组件实例 */

  var ref = React__default.createRef();
  /** 每个实例需要按顺序进行处理，第一个render后在执行第二个，未执行到的存放于此处 */

  var stock = [];
  /** 是否正在render，防止插队 */

  var rendering = false;
  /* 核心控制组件，用于管理组件实例列表并提供一些常用接口 */

  var RenderController = React.forwardRef(function RenderController(props, fRef) {
    var _useState = React.useState([]),
        _useState2 = _slicedToArray(_useState, 2),
        list = _useState2[0],
        setList = _useState2[1];

    React.useImperativeHandle(fRef, function () {
      return {
        close: close,
        closeAll: closeAll,
        remove: onRemove,
        removeAll: onRemoveAll,
        update: update
      };
    });
    /* 发起api调用时，合并到prop (在api中，每一次props改变都等于调用了一次api) */

    React.useEffect(function () {
      if (props.isInit) return;
      setList(function (prev) {
        // 超出配置的实例数时，移除第一个show为true的实例
        if (prev.length >= maxInstance && prev.length > 0) {
          var ind = prev.findIndex(function (item) {
            return item.show;
          });
          prev[ind].show = false;
        }

        return [].concat(_toConsumableArray(prev), [_objectSpread2({}, props, {
          show: 'show' in props ? props.show : true
        })]);
      });
    }, [props]);
    /**
     * 从列表移除元素实例
     * 下面的几个方法使用setTimeout的原因是，在renderApi调用后，RenderController内用于更新状态的useEffect尚未触发更新，此时最新的实例列表中是没有当次操作新增的实例的，如果马上调用下面这些方法会不起任何作用，所以需要通过setTimeout来hack一下
     * */

    function onRemove(id) {
      // 移除前请先确保该项的show已经为false，防止破坏掉关闭动画等 */
      setTimeout(function () {
        setList(function (p) {
          return p.filter(function (v) {
            var notCurrent = v.id !== id;

            if (!notCurrent && v.onRemove) {
              v.onRemove(); // 当作为api使用时，需要模拟onRemove行为
            }

            return notCurrent;
          });
        });
      });
    }
    /* 移除所有实例 */


    function onRemoveAll() {
      setTimeout(function () {
        return setList(function (prev) {
          prev.forEach(function (ins) {
            ins.onRemove && ins.onRemove(); // 当作为api使用时，需要模拟onRemove行为
          });
          return [];
        });
      });
    }
    /** 设置指定组件实例的show为false, ...args用于为props.onClose提供额外参数 */


    function close(id) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      setTimeout(function () {
        return closeHandle.apply(void 0, [id].concat(args));
      });
    }
    /** 同close, 区别是不匹配id直接移除全部 */


    function closeAll() {
      setTimeout(function () {
        return closeHandle();
      });
    }
    /** 根据指定id和props更新组件 */


    function update(id, newProps) {
      setList(function (p) {
        return p.map(function (item) {
          if (item.id === id) {
            item = _objectSpread2({}, item, {}, newProps);
          }

          return item;
        });
      });
    }
    /* 根据是否传id隐藏一个/全部实例 */


    function closeHandle(id) {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      setList(function (p) {
        return p.map(function (v) {
          var temp = _objectSpread2({}, v);

          if (id) {
            if (v.id === id && temp.show) {
              temp.show = false;
              temp.onClose && temp.onClose.apply(temp, args); // 当作为api使用时，需要模拟onClose行为
            }
          } else {
            if (temp.show) {
              temp.show = false;
              temp.onClose && temp.onClose(); // 当作为api使用时，需要模拟onClose行为
            }
          }

          return temp;
        });
      });
    }

    return list.map(function (_ref) {
      var id = _ref.id,
          isInit = _ref.isInit,
          v = _objectWithoutProperties(_ref, ["id", "isInit"]);

      return (
        /* 直接将id bind到onRemove上实例组件就不用传id了 */
        React__default.createElement(Component, Object.assign({}, v, {
          key: id,
          namespace: namespace,

          /* eslint-disable-next-line react/jsx-no-bind */
          onClose: close.bind(null, id),

          /* eslint-disable-next-line react/jsx-no-bind */
          onRemove: onRemove.bind(null, id)
        }))
      );
    });
  });
  /* 动态渲染RenderController组件，包含Wrap时会一并渲染 */

  function renderApi(_ref2) {
    var singleton = _ref2.singleton,
        props = _objectWithoutProperties(_ref2, ["singleton"]);

    var id = utils.createRandString(2);

    var _props = _objectSpread2({}, props, {
      id: id
    });

    var closeAll = ref.current && ref.current.closeAll;

    if (singleton && closeAll) {
      closeAll();
    }

    stock.push(_props);
    render();
    return [ref.current, id];
  }
  /** 从stock中取出第一个配置对象并创建实例，如果正在render中，延迟到下一loop */


  function render() {
    if (rendering) {
      setTimeout(function () {
        return render();
      });
      return;
    }

    rendering = true;
    var current = stock.splice(0, 1)[0];
    if (!current) return;
    var controller = React__default.createElement(RenderController, Object.assign({
      ref: ref
    }, current));
    ReactDom.render(Wrap ? React__default.createElement(Wrap, null, controller) : controller, utils.getPortalsNode(namespace), function () {
      rendering = false;
    });
  } // 初始化调用，防止ref不存在


  renderApi({
    show: false,
    isInit: true
  });
  return renderApi;
}

module.exports = createRenderApi;
