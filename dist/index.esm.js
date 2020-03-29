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
      namespace = option.namespace;
  /* 返回组件实例 */

  var ref = React.createRef();
  /* 核心render组件，用于管理组件实例列表并提供一些常用接口 */

  var RenderController = forwardRef(function RenderController(props, Fref) {
    var _useState = useState([]),
        _useState2 = _slicedToArray(_useState, 2),
        list = _useState2[0],
        setList = _useState2[1];

    useImperativeHandle(Fref, function () {
      return {
        close: close,
        closeAll: closeAll,
        remove: onRemove,
        removeAll: onRemoveAll,
        update: update
      };
    });
    /* 发起api调用时，合并到prop (在api中，每一次props改变都等于调用了一次api) */

    useEffect(function () {
      if (props.isInit) return;
      setList(function (prev) {
        // 超出配置的实例数时，移除第一个show为true的实例
        if (prev.length >= maxInstance && prev.length > 0) {
          var ind = prev.findIndex(function (item) {
            return item.show;
          });
          prev[ind].show = false;
        }

        return [].concat(_toConsumableArray(prev), [_objectSpread({}, props, {
          show: 'show' in props ? props.show : true
        })]);
      });
    }, [props]);
    /**
     * 从列表移除元素实例
     * 下面的几个方法使用setTimeout的原因是，在renderApi调用后，RenderController内用于更新状态的useEffect尚未触发更新，此时最新的实例列表中是没有当次操作新增的实例的，如果马上调用下面这些方法会不起任何作用，所以需要通过setTimeout来hack一下
     * */

    function onRemove(removeId) {
      // 移除前请先确保该项的show已经为false，防止破坏掉关闭动画等 */
      setTimeout(function () {
        setList(function (p) {
          return p.filter(function (v) {
            var notCurrent = v.id !== removeId;

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
    /** 设置指定组件实例的show为false */


    function close(id) {
      setTimeout(function () {
        return closeHandle(id);
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
            if (v.id === id && temp.show) {
              temp.show = false;
              temp.onClose && temp.onClose(); // 当作为api使用时，需要模拟onClose行为
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
        React.createElement(Component, Object.assign({}, v, {
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
  } // @ts-ignore


  renderApi({
    show: false,
    isInit: true
  });
  return renderApi;
}

export default createRenderApi;
