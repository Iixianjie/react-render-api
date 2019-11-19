import React, {
  forwardRef, useEffect, useImperativeHandle, useState,
  ComponentType,
} from 'react';
import ReactDom from 'react-dom';
import { getPortalsNode } from '@lxjx/utils';

/**
 * 下文中的所有移除实例指的是将指定实例的props.show设置为false, 要移除实例，需要在渲染组件内部根据条件props.show = false调用onRemove()来移除，
 * 这样做的原因是大部分需要渲染的组件都是带动画的，直接移除实例会导致组件生硬的消失，所以更好的方式是仅对 “该组件可移除” 进行通知
 * */

/* 创建时的配置 */
interface Option {
  /** 包裹元素，如果传入，会用其对渲染出来的组件进行包裹 */
  wrap?: ComponentType<any>;
  /** 最大实例数，调用api创建的实例数超过此数值时，会移除最先创建实例, 遵循“先进先出” */
  maxInstance?: number;
}

/** 调用api后返回的实例 */
export interface ReactRenderApiInstance {
  /** 关闭指定实例 */
  close: (id: number) => void;
  /** 关闭所有实例 */
  closeAll: () => void;
}

/** 传入实例组件中的额外prop，可以用它来扩展声明实例组件的Props type */
export interface ReactRenderApiProps {
  /** 实例组件是否显示 */
  show?: boolean;
  /** 从实例列表移除指定实例, 如果组件带关闭动画，请先使用onClose，然后在show = false时执行关闭动画并在合适的时机执行此方法来移除实例 */
  onRemove?: () => void;
  /** 将该项的show设置为false */
  onClose?: () => void;
}

/** renderApi创建后，配置项除了渲染组件本身的Props外，还包含一下额外的配置项 */
export interface ReactRenderApiExtraProps {
  /** 相同api下每次只会存在一个实例 */
  singleton?: boolean;
}


export default function createRenderApi<T extends {}>(Component: any, option = {} as Option) {
  const { wrap: Wrap, maxInstance = Infinity } = option;
  type MixT = T & { show: boolean; id: number };

  /* 用于返回组件 */
  const ref = React.createRef<ReactRenderApiInstance>();
  /* render组件，用于管理组件实例列表并提供一些常用接口 */
  const RenderController = forwardRef<ReactRenderApiInstance, MixT>(function RenderController(props, Fref): any {
    const [list, setList] = useState<MixT[]>([]);

    useImperativeHandle(Fref, () => ({
      close,
      closeAll,
    }));

    /* 发起api调用时，合并到prop */
    useEffect(() => {
      setList((prev: MixT[]) => {
        // 超出配置的实例数时，先进先出
        if (prev.length >= maxInstance && prev.length > 0) {
          const ind = prev.findIndex(item => item.show);
          prev[ind].show = false;
        }
        return [...prev, { ...props, show: true }];
      });
    }, [props]);

    /* 从列表移除元素 */
    function onRemove(removeId: number) {
      // 移除前请先确保该项的show已经为false，防止破坏掉关闭动画等 */
      setList((p) => p.filter((v) => v.id !== removeId));
    }

    /* 设置指定组件实例的show为false */
    function close(id: number) {
      closeHandle(id);
    }

    /* 同close, 区别是不匹配id直接移除全部 */
    function closeAll() {
      closeHandle();
    }

    /* 根据是否传id隐藏一个/全部实例 */
    function closeHandle(id?: number) {
      setList((p) => p.map((v) => {
        const temp = { ...v };
        if (id) {
          if (v.id === id) {
            temp.show = false;
          }
        } else {
          temp.show = false;
        }

        return temp;
      }));
    }

    return list.map(({ id, ...v }) => (
      /* 直接将id bind到onRemove上实例组件就不用传id了 */
      <Component
        key={id}
        {...v}
        /* eslint-disable-next-line react/jsx-no-bind */
        onClose={close.bind(null, id)}
        /* eslint-disable-next-line react/jsx-no-bind */
        onRemove={onRemove.bind(null, id) as () => void}
      />
    ));
  });

  /* 动态渲染RenderController组件，包含Wrap时会一并渲染 */
  function renderApi({ singleton, ...props }: T & ReactRenderApiExtraProps) {
    const id = Math.random();
    const _props = { ...props, id };

    const closeAll = ref.current && ref.current.closeAll;

    if (singleton && closeAll) {
      closeAll();
    }

    const controller = <RenderController ref={ref} {..._props as any} />;

    ReactDom.render(
      Wrap
        ? (
          <Wrap>
            {controller}
          </Wrap>
        ) : controller,
      getPortalsNode(),
    );

    return [ref.current, id] as [ReactRenderApiInstance, number];
  }

  return renderApi;
}