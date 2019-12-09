import _objectWithoutProperties from '@babel/runtime/helpers/esm/objectWithoutProperties';
import _defineProperty from '@babel/runtime/helpers/esm/defineProperty';
import _toConsumableArray from '@babel/runtime/helpers/esm/toConsumableArray';
import _slicedToArray from '@babel/runtime/helpers/esm/slicedToArray';
import React, { forwardRef, useState, useImperativeHandle, useEffect } from 'react';
import ReactDom from 'react-dom';
import { createRandString, getPortalsNode } from '@lxjx/utils';

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
function createRenderApi(Component) {
  var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var Wrap = option.wrap,
      _option$maxInstance = option.maxInstance,
      maxInstance = _option$maxInstance === void 0 ? Infinity : _option$maxInstance,
      namespace = option.namespace; // function ApiComponent(props: any) {
  //   return <Component {...props} />
  // }

  /* 返回组件实例 */

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
        closeAll: closeAll,
        update: update
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

        return [].concat(_toConsumableArray(prev), [_objectSpread({}, props, {
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
    /** 设置指定组件实例的show为false */


    function close(id) {
      closeHandle(id);
    }
    /** 同close, 区别是不匹配id直接移除全部 */


    function closeAll() {
      closeHandle();
    }
    /** 根据指定id和props更新组件 */


    function update(id, newProps) {
      setList(function (p) {
        return p.map(function (item) {
          if (item.id === id) {
            item = _objectSpread({}, item, {}, newProps);
          }

          return item;
        });
      });
    }
    /* 根据是否传id隐藏一个/全部实例 */


    function closeHandle(id) {
      setList(function (p) {
        return p.map(function (v) {
          var temp = _objectSpread({}, v);

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

    var id = createRandString(2);

    var _props = _objectSpread({}, props, {
      id: id
    });

    var closeAll = ref.current && ref.current.closeAll;

    if (singleton && closeAll) {
      closeAll();
    }

    var controller = React.createElement(RenderController, Object.assign({
      ref: ref
    }, _props));
    ReactDom.render(Wrap ? React.createElement(Wrap, null, controller) : controller, getPortalsNode(namespace));
    return [ref.current, id];
  }

  return renderApi;
}

export default createRenderApi;
