<h1 align="center" style="color: #61dafb;">react-render-api</h1>
<h1 align="center" style="font-size: 80px;color:#61dafb">🔌</h1>
<p align="center">通过api来渲染你的react组件</p>


<br>

## 📋`Introduction`

轻松的通过react实现modal、drawer、tips等需要在外部唤起的react组件。



<br>

<br>

## 🎨`example`

以下是一个通过react-render-api实现的message组件

![loading...](https://github.com/Iixianjie/react-render-api/raw/master/example.gif)

<br>

<br>

## 📦`install`

```shell
npm install @lxjx/react-render-api
# or
yarn add @lxjx/react-render-api
```

<br>

<br>

## 🗺useage

**用例：**实现一个基础的提示组件，它会在api触发后存在1秒，并在1s后通过fade的方式离场。

1.create component

```tsx
import { ReactRenderApiPropBase } from '@lxjx/react-render-api';

export interface TipsProps extends ReactRenderApiPropBase {
  title: string;
  desc?: string;
}

export default function Tips(props: TipsProps) {
    
  React.useEffect(() => {
    if (props.show) {
      /** 处理显示 **/
      
      // 提示一秒后隐藏，调用onClose通知控制组件将此实例的show设置为false
      // 如果不包含离场动画，可以直接调用props.Remove()
      setTimeout(() => props.onClose(), 1000);
      
    } else {
      /** 处理隐藏 **/
      
      // 当组件存在离场动画时，在合适的时间通过onRemove()通知控制组件移除该组件实例
      setTimeout(() => props.onRemove(), 1000);
      
    }
  }, [props.show]);

  return (
    <div style={{ opacity: props.show ? 1 : 0, transition: '1s' }}>
      <div>{props.title}</div>
      <div>{props.desc}</div>
    </div>
  );
};
```

2. create renderApi

```tsx
import Tips, { TipsProps } from './Tips';
import createRenderApi from '@lxjx/react-render-api';

// 这里的TipsProps决定了api可以传入的参数
const renderApi = createRenderApi<TipsProps>(Demo);

renderApi({
    title: 'im a title...',
		/** 内置选项 **/
    // singleton: true, // 最多只会同时存在一个组件实例
  	// onClose() {} // 组件关闭
  	// onRemove() {} // 组件实例移除
})
```

<br>

<br>



## 🔑`原理`

调用 `createRenderApi` 创建api后，该api会拥有一个独立的顶层组件来管理通过api渲染的所有`API Component`实例，顶层组件会在内部维护一个List，并为每一个`API Component`实例提供`props.show`来作为组件的开关,`API Component`组件根据show的状态来实现对应的动画逻辑或显示隐藏状态, `API Component`内部可以通过`props.onClose()`来通知顶层组件将它的`show`设置为`false`, 如果组件使用了动画，应该在动画结束后通过`props.onRemove()`移除该组件的实例。



<br>

<br>

## 📜`API`

### createRenderApi()

创建一个 render api

```typescript
const renderApi = createRenderApi<ApiOptions>(Component, Option);
// ApiOptions: 此Api的所有配置选项

/* configuration at creation time */
interface Option: {
  /** 包装组件，如果你的api组件依赖于特定的布局，可以通过传递此项来包裹它们 */
  wrap?: ComponentType<any>;
  /** 最大实例数，当api渲染的组件数超过此数值时，会将最先进入的实例的show设为false，你需要在合适的时机调用onRemove移除实例 */
  maxInstance?: number;
  /** 将实例渲染到指定命名空间的节点下, 而不是使用默认的渲染节点 */
  namespace?: string;
}
```

<br>

### renderApi()

通过createRenderApi创建的api方法

```typescript
const [ref, id] = renderApi(options)

// options: 
// 除了创建api时传入的createRenderApi<ApiOptions>外，api自带如下选项
interface ReactRenderApiExtraProps {
  /** 相同api下每次只会存在一个实例  */
  singleton?: boolean;
}

// ref: 
interface ReactRenderApiInstance {
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
```

<br>

### API Component

传递给api组件的额外props

```ts
interface ReactRenderApiProps {
  /** 实例组件是否显示 */
  show?: boolean;
  /** 从实例列表移除指定实例, 如果组件带关闭动画，请先使用onClose，然后在show = false时执行关闭动画并在合适的时机执行此方法来移除实例 */
  onRemove?: () => void;
  /** 将该项的show设置为false */
  onClose?: () => void;
  /** 此参数透传至createRenderApi(options)中的option.namespace，用于帮助组件渲染到自定义命名的节点下
   *  用于某些可能会存在组件形式与api形式一起使用的组件(如modal)，同节点下渲染两种组件会造成react渲染冲突。
   * */
  namespace?: string;
}
```










