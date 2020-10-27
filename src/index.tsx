import React, {
  forwardRef, useEffect, useImperativeHandle, useState,
  ComponentType,
} from 'react';
import ReactDom from 'react-dom';
import {getPortalsNode, createRandString} from '@lxjx/utils';

/* 创建时的配置 */
interface Option {
  /** 包裹元素，如果传入，会用其对渲染出来的组件进行包裹 */
  wrap?: ComponentType<any>;
  /** Infinity | 最大实例数，调用api创建的实例数超过此数值时，会移除最先创建实例, 遵循“先进先出” */
  maxInstance?: number;
  /** 将实例渲染到指定命名空间的节点下, 而不是使用默认的渲染节点 */
  namespace?: string;
}

/** 调用api后返回的实例 */
export interface ReactRenderApiInstance<T = {}> {
  /** 关闭指定实例 */
  close: (id: string) => void;
  /** 关闭所有实例 */
  closeAll: () => void;
  /** 移除指定实例 */
  remove: (id: string) => void;
  /** 移除所有实例 */
  removeAll: () => void;
  /** 根据指定id和option更新组件 */
  update: (id: string, newOptions: Partial<T>) => void;
}

/** 实现组件需要实现的方法/属性 */
export interface ReactRenderApiPropBase {
  /** 从实例列表移除指定实例, 如果组件带关闭动画，请先使用onClose，然后在show = false时执行关闭动画并在合适的时机执行此方法来移除实例 */
  onRemove?: () => void;
  /** 将该项的show设置为false */
  onClose?: () => void;
  /** 实例组件是否显示 */
  show?: boolean;
}

/** 实现组件的基础props, 将由api控制器组件提供 */
export interface ReactRenderApiProps extends ReactRenderApiPropBase {
  /** 此参数透传至createRenderApi(options)中的option.namespace，用于帮助组件渲染到自定义命名的节点下
   *  用于某些可能会存在组件形式与api形式一起使用的组件(如modal)，同节点下渲染两种组件会造成react渲染冲突。
   * */
  namespace?: string;
}

/** renderApi创建后，配置项除了渲染组件本身的Props外，还包含以下额外的配置项 */
export interface ReactRenderApiExtraProps {
  /** 相同api下每次只会存在一个实例 */
  singleton?: boolean;
}

export default function createRenderApi<T extends object>(Component: ComponentType<any>, option = {} as Option) {
  const {wrap: Wrap, maxInstance = Infinity, namespace} = option;

  /** 用户传入的选项 */
  type ConfItem = T & ReactRenderApiExtraProps;

  /** 内部使用的每个实例包含的选项 */
  type MixT = T & ReactRenderApiExtraProps & ReactRenderApiProps & { show: boolean; id: string, isInit: boolean };

  /** 返回组件实例 */
  const ref = React.createRef<ReactRenderApiInstance<T>>();

  /** 每个实例需要按顺序进行处理，第一个render后在执行第二个，未执行到的存放于此处 */
  const stock: ConfItem[] = [];

  /** 是否正在render，防止插队 */
  let rendering = false;

  /* 核心控制组件，用于管理组件实例列表并提供一些常用接口 */
  const RenderController = forwardRef<ReactRenderApiInstance<T>, MixT>(function RenderController(props, fRef): any {
    const [list, setList] = useState<MixT[]>([]);

    useImperativeHandle(fRef, () => ({
      close,
      closeAll,
      remove: onRemove,
      removeAll: onRemoveAll,
      update,
    }));

    /* 发起api调用时，合并到prop (在api中，每一次props改变都等于调用了一次api) */
    useEffect(() => {
      if (props.isInit) return;

      setList((prev) => {
        // 超出配置的实例数时，移除第一个show为true的实例
        if (prev.length >= maxInstance && prev.length > 0) {
          const ind = prev.findIndex(item => item.show);
          prev[ind].show = false;
        }

        return [...prev, {...props, show: 'show' in props ? props.show : true}];
      });

    }, [props]);

    /**
     * 从列表移除元素实例
     * 下面的几个方法使用setTimeout的原因是，在renderApi调用后，RenderController内用于更新状态的useEffect尚未触发更新，此时最新的实例列表中是没有当次操作新增的实例的，如果马上调用下面这些方法会不起任何作用，所以需要通过setTimeout来hack一下
     * */
    function onRemove(id: string) {
      // 移除前请先确保该项的show已经为false，防止破坏掉关闭动画等 */
      setTimeout(() => {
        setList((p) => p.filter((v) => {
          const notCurrent = v.id !== id;
          if (!notCurrent && v.onRemove) {
            v.onRemove();  // 当作为api使用时，需要模拟onRemove行为
          }
          return notCurrent;
        }));
      });
    }

    /* 移除所有实例 */
    function onRemoveAll() {
      setTimeout(() => setList(prev => {
        prev.forEach((ins) => {
          ins.onRemove && ins.onRemove();  // 当作为api使用时，需要模拟onRemove行为
        });
        return [];
      }));
    }

    /** 设置指定组件实例的show为false, ...args用于为props.onClose提供额外参数 */
    function close(id: string, ...args: any) {
      setTimeout(() => closeHandle(id, ...args));
    }

    /** 同close, 区别是不匹配id直接移除全部 */
    function closeAll() {
      setTimeout(() => closeHandle());
    }

    /** 根据指定id和props更新组件 */
    function update(id: string, newProps: Partial<T>) {
      setList(p => p.map(item => {
        if (item.id === id) {
          item = {...item, ...newProps};
        }
        return item;
      }));
    }

    /* 根据是否传id隐藏一个/全部实例 */
    function closeHandle(id?: string, ...args: any) {
      setList((p) => p.map((v) => {
        const temp = {...v};
        if (id) {
          if (v.id === id && temp.show) {
            temp.show = false;
            temp.onClose && (temp.onClose as any)(...args); // 当作为api使用时，需要模拟onClose行为
          }
        } else {
          if (temp.show) {
            temp.show = false;
            temp.onClose && temp.onClose(); // 当作为api使用时，需要模拟onClose行为
          }
        }

        return temp;
      }));
    }

    return list.map(({id, isInit, ...v}) => (
      /* 直接将id bind到onRemove上实例组件就不用传id了 */
      <Component
        {...v}
        key={id}
        namespace={namespace}
        /* eslint-disable-next-line react/jsx-no-bind */
        onClose={close.bind(null, id)}
        /* eslint-disable-next-line react/jsx-no-bind */
        onRemove={onRemove.bind(null, id) as () => void}
      />
    ));
  });

  /* 动态渲染RenderController组件，包含Wrap时会一并渲染 */
  function renderApi({singleton, ...props}: ConfItem) {
    const id = createRandString(2);

    const _props: any = {...props, id};

    const closeAll = ref.current && ref.current.closeAll;

    if (singleton && closeAll) {
      closeAll();
    }

    stock.push(_props);

    render();

    return [ref.current, id] as [ReactRenderApiInstance<T>, string];
  }

  /** 从stock中取出第一个配置对象并创建实例，如果正在render中，延迟到下一loop */
  function render() {
    if (rendering) {
      setTimeout(() => render());
      return;
    }

    rendering = true;

    const current = stock.splice(0, 1)[0];

    if (!current) return;

    const controller = <RenderController ref={ref} {...current as any} />;

    ReactDom.render(
      Wrap
        ? (
          <Wrap>
            {controller}
          </Wrap>
        ) : controller,
      getPortalsNode(namespace),
      () => {
        rendering = false;
      }
    );
  }

  // 初始化调用，防止ref不存在
  renderApi({show: false, isInit: true} as any);

  return renderApi;
}
