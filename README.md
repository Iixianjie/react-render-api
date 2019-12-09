<h1 align="center" style="color: #61dafb;">react-render-api</h1>

<h1 align="center" style="font-size: 80px;color:#61dafb">🔌</h1>

<p align="center">render your react components through call api</p>
<p align="center">通过api来渲染你的react组件</p>



<br>

## 📋`Introduction`

by calling api to render react components as separate instance, you can easily use react to implement common functions such as modal, drawer, tips, and so on!

通过此库、你可以轻松的通过react实现modal、drawer、tips等需要在外部唤起的react组件。



<br>

<br>

## 🎨`example`

Below is a message component implemented by react-render-api

以下是一个通过react-render-api实现的message组件 // TODO: 添加bk链接

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

Implement a basic hint component, which will exist for 1 second after the API is triggered, and then leave the game through fade.

实现一个基础的提示组件，它会在api触发后存在1秒，然后通过fade的方式离场。



1.create ur component

```tsx
const Demo = (props: ReactRenderApiProps & DemoProps) => {
    
  React.useEffect(() => {
    if (props.show) {
      // hidden after one second
      setTimeout(() => props.onClose && props.onClose(), 1000);
    } else {
      // remove current instance after one second(prevent damage to animation)
      setTimeout(() => props.onRemove && props.onRemove(), 1000);
    }
  }, [props.show]);

  return (
    <div style={{ opacity: props.show ? 1 : 0, transition: '0.5s' }}>
      <div>{props.title}</div>
      <div>{props.desc}</div>
    </div>
  );
};
```

2. create renderApi

```tsx
import Demo from './Demo';
import createRenderApi from '@lxjx/react-render-api';

type Option = {
    title: string;
    desc?: string;
}

const renderApi = createRenderApi<Option>(Demo);

renderApi({
    title: 'im a title...',
    // only one instance can exist at the same time
    // 当传递此选项时，实例列表中最多只会同时存在一个组件实例
    // singleton: true,
})
```

<br>

<br>

## 📜`API`

### createRenderApi

create a render api

```typescript
const renderApi = createRenderApi<ApiOptions>(Component, Option);
// ApiOptions: configuration parameters for api

/* configuration at creation time */
interface Option: {
  /** the wrapper element, if passed in, wraps the rendered component with it */
  wrap?: ComponentType<any>;
  /** Maximum number of instances, when the number of instances created by calling api exceeds this value, the first instance created will be removed, following the "first in, first out */
  maxInstance?: number;

  namespace?: string;
}
```

<br>

### renderApi

generate a component instance by createRenderApi

```typescript
const [ref, id] = renderApi(options)

// options: 
// after the renderApi is created, the configuration items include the following additional configuration items in addition to the Props of the rendering component itself
interface ReactRenderApiExtraProps {
  /** There will only be one instance at a time under the same api */
  singleton?: boolean;
}

// ref: 
interface ReactRenderApiInstance {
  /** close the specified instance by id */
  close: (id: number) => void;
  /** close all instance */
  closeAll: () => void;
}

// id
```

<br>

### props passed to component

passing extra props in the instance component

```ts
interface ReactRenderApiProps {
  /** whether the instance component is displayed */
  show?: boolean;
  /** remove the specified instance from the list of instances. If the component has a close animation, use onClose first, then show = false and then execute the method at the appropriate time to remove the instance. */
  onRemove?: () => void;
  /** Set show to false */
  onClose?: () => void;
}
```










