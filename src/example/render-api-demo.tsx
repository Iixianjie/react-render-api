import * as React from 'react';

import renderApi from './demo-component';

function render1(num: number) {
  const [ref, id] = renderApi({
    name: 'lxj',
    age: 17,
    // singleton: true,
  });

  console.log(num, ref, id);
}

// for (let i = 0;i<10;i++) {
//   render1(i);
// }


const RenderApiDemo = () => {

  React.useEffect(() => {
    render1(4);
  });

  return (
    <div>
      {/*{ReactDom.render(*/}
      {/*  <DemoComponent show={true} />,*/}
      {/*  getPortalsNode(),*/}
      {/*)}*/}
      RenderApiDemo
      <div>
        <button
          onClick={() => {
            const [ref, id] = renderApi({
              name: 'lxj',
              age: 17,
              onClose() {
                console.log(123);
              },
              onRemove() {
                console.log(456);
                
              }
              // singleton: true,
            });
            setTimeout(() => {
              // ref.update(id, {
              //   name: 'jxl',
              // });
              ref.removeAll();
            }, 1000);
          }}
          type="button"
        >render
        </button>
      </div>
    </div>
  );
};

export default RenderApiDemo;

// function tempFn(methodKey, ...arg) {
//   console.log('延迟调用1', ref.current)
//   setTimeout(() => {
//     if (ref.current) {
//       console.log('延迟调用2', ref.current)
//       ref.current[methodKey](...arg);
//     } else {
//       tempFn(methodKey, ...arg);
//     }
//   }, 50);
// }
//
// const temp = {
//   close(id){ tempFn('close', id) },
//   closeAll(){ tempFn('closeAll') },
//   remove(removeId){ tempFn('remove', removeId) },
//   removeAll(){ tempFn('removeAll') },
//   update(id, newProps) { tempFn('update', id, newProps) },
// }