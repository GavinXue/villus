import { mount, createLocalVue } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import { Subscription, createClient, Provider } from '../src/index';
import { makeObservable } from './helpers/observer';

const Vue = createLocalVue();
Vue.component('Subscription', Subscription);

test('Handles subscriptions', async () => {
  const client = createClient({
    url: 'https://test.com/graphql',
    subscriptionForwarder: () => {
      return makeObservable();
    }
  });

  const wrapper = mount(
    {
      data: () => ({
        client
      }),
      components: {
        Subscription,
        Provider,
        Child: {
          props: ['newMessages'],
          data: () => ({ messages: [] }),
          watch: {
            newMessages(this: any, message: object) {
              this.messages.push(message);
            }
          },
          template: `
            <ul>
              <li v-for="msg in messages">{{ msg.id }}</li>
            </ul>
          `
        }
      },
      template: `
        <Provider :client="client">
          <Subscription query="subscription { newMessages }" v-slot="{ data }">
            <Child :newMessages="data" />
          </Subscription>
        </Provider>
    `
    },
    { sync: false }
  );

  await (global as any).sleep(510);
  await flushPromises();
  expect(wrapper.findAll('li')).toHaveLength(5);
  wrapper.destroy();
});

test('Handles observer errors', async () => {
  const client = createClient({
    url: 'https://test.com/graphql',
    subscriptionForwarder: () => {
      return makeObservable(true);
    }
  });

  const wrapper = mount(
    {
      data: () => ({
        client
      }),
      components: {
        Subscription,
        Provider
      },
      template: `
      <div>
        <Provider :client="client">
          <Subscription query="subscription { newMessages }" v-slot="{ error }">
            <p v-if="error">{{ error.message }}</p>
          </Subscription>
        </Provider>
      </div>
    `
    },
    { sync: false }
  );

  await (global as any).sleep(150);
  await flushPromises();
  expect(wrapper.find('p').text()).toContain('oops!');
  wrapper.destroy();
});

test('renders a span if multiple root is found', async () => {
  const client = createClient({
    url: 'https://test.com/graphql',
    subscriptionForwarder: () => {
      return makeObservable(true);
    }
  });

  const wrapper = mount(
    {
      data: () => ({
        client
      }),
      components: {
        Subscription,
        Provider
      },
      template: `
        <Provider :client="client">
          <Subscription query="subscription { newMessages }" v-slot="{ data }">
            <span>{{ data }}</span>
            <span>{{ data }}</span>
          </Subscription>
       </Provider>
    `
    },
    { sync: false }
  );

  await flushPromises();
  expect(wrapper.findAll('span')).toHaveLength(3);
  wrapper.destroy();
});

test('Fails if provider was not resolved', async () => {
  expect(() => {
    mount(
      {
        components: {
          Subscription
        },
        template: `
          <Subscription query="subscription { newMessages }" v-slot="{ data }">
            {{ data }}
          </Subscription>
        `
      },
      { sync: false }
    );
  }).toThrow(/Client Provider/);
});
