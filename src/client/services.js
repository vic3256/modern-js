import io from 'socket.io-client';

import {ObservableSocket} from 'shared/observable-socket';
import {UsersStore} from './stores/users';
import {ChatStore} from './stores/chat';

// exporting a const var since services are singletons
export const socket = io({ autoConnect: false });
export const server = new ObservableSocket(socket);

// create socket wrapper

// create playlist store

// create user store
export const usersStore = new UsersStore(server);
export const chatStore = new ChatStore(server, usersStore);

// create chat store