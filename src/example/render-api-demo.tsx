import * as React from 'react';
import ReactDom from 'react-dom';
import { getPortalsNode } from '@lxjx/utils';

import renderApi, { DemoComponent } from './demo-component';

const portalsID = 'J__PORTALS__NODE';
export const getPortalsNode2 = (namespace?: string) => {
  let portalsEl = document.getElementById(portalsID);

  if (!portalsEl) {
    const el = document.createElement('div');
    el.id = portalsID + (namespace ? '__' + namespace : '');
    el.setAttribute('warning', '⛔⛔HIGH ENERGY⛔⛔');
    portalsEl = document.body.appendChild(el);
  }
  return portalsEl;
};

const RenderApiDemo = () => {

  return (
    <div>
      RenderApiDemo
      <div>
        <button
          onClick={() => {
            const [ref, id] = renderApi({
              name: 'lxj',
              age: 17,
              // singleton: true,
            });

            // setTimeout(() => {
            //   ref.update(id, {
            //     name: 'jxl',
            //   });
            // }, 1000);
            console.log(ref);
          }}
          type="button"
        >render
        </button>
      </div>
    </div>
  );
};

export default RenderApiDemo;
