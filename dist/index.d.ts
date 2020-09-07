import { ComponentType } from 'react';
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
export default function createRenderApi<T extends object>(Component: ComponentType<any>, option?: Option): ({ singleton, ...props }: T & ReactRenderApiExtraProps) => [ReactRenderApiInstance<T>, string];
export {};
