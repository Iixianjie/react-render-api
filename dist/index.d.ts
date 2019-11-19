import { ComponentType } from 'react';
/**
 * 下文中的所有移除实例指的是将指定实例的props.show设置为false, 要移除实例，需要在渲染组件内部根据条件props.show = false调用onRemove()来移除，
 * 这样做的原因是大部分需要渲染的组件都是带动画的，直接移除实例会导致组件生硬的消失，所以更好的方式是仅对 “该组件可移除” 进行通知
 * */
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
export default function createRenderApi<T extends {}>(Component: any, option?: Option): ({ singleton, ...props }: T & ReactRenderApiExtraProps) => [ReactRenderApiInstance, number];
export {};