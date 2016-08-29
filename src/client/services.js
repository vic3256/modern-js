import io from 'socket.io-client';

import {ObservableSocket} from 'shared/observable-socket';

// exporting a const var since services are singletons
export const socket = io({ autoConnect: false });
export const server = new ObservableSocket(socket);

// create socket wrapper

// create playlist store

// create user store

// create chat store