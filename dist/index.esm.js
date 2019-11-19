import React, { forwardRef, useState, useImperativeHandle, useEffect } from 'react';
import ReactDom from 'react-dom';
import { getPortalsNode } from '@lxjx/utils';

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
      maxInstance = _option$maxInstance === void 0 ? Infinity : _option$maxInstance;
  /* 用于返回组件 */

  var ref = React.createRef();
  /* render组件，用于管理组件实例列表并提供一些常用接口 */

  var RenderController = forwardRef(function RenderController(props, Fref) {
    var _useState = useState([]),
        _useState2 = _slicedToArray(_useState, 2),
        list = _useState2[0],
        setList = _useState2[1];

    useImperativeHandle(Fref, function () {
      return {
        close: close,
        closeAll: closeAll
      };
    });
    /* 发起api调用时，合并到prop */

    useEffect(function () {
      setList(function (prev) {
        // 超出配置的实例数时，先进先出
        if (prev.length >= maxInstance && prev.length > 0) {
          var ind = prev.findIndex(function (item) {
            return item.show;
          });
          prev[ind].show = false;
        }

        return [].concat(_toConsumableArray(prev), [_objectSpread2({}, props, {
          show: true
        })]);
      });
    }, [props]);
    /* 从列表移除元素 */

    function onRemove(removeId) {
      // 移除前请先确保该项的show已经为false，防止破坏掉关闭动画等 */
      setList(function (p) {
        return p.filter(function (v) {
          return v.id !== removeId;
        });
      });
    }
    /* 设置指定组件实例的show为false */


    function close(id) {
      closeHandle(id);
    }
    /* 同close, 区别是不匹配id直接移除全部 */


    function closeAll() {
      closeHandle();
    }
    /* 根据是否传id隐藏一个/全部实例 */


    function closeHandle(id) {
      setList(function (p) {
        return p.map(function (v) {
          var temp = _objectSpread2({}, v);

          if (id) {
            if (v.id === id) {
              temp.show = false;
            }
          } else {
            temp.show = false;
          }

          return temp;
        });
      });
    }

    return list.map(function (_ref) {
      var id = _ref.id,
          v = _objectWithoutProperties(_ref, ["id"]);

      return (
        /* 直接将id bind到onRemove上实例组件就不用传id了 */
        React.createElement(Component, Object.assign({
          key: id
        }, v, {
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

    var id = Math.random();

    var _props = _objectSpread2({}, props, {
      id: id
    });

    var closeAll = ref.current && ref.current.closeAll;

    if (singleton && closeAll) {
      closeAll();
    }

    var controller = React.createElement(RenderController, Object.assign({
      ref: ref
    }, _props));
    ReactDom.render(Wrap ? React.createElement(Wrap, null, controller) : controller, getPortalsNode());
    return [ref.current, id];
  }

  return renderApi;
}

export default createRenderApi;
