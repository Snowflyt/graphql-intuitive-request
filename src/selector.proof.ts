import { describe, equal, expect, it } from 'typroof';

import { selectorBuilder } from './selector';

import type { Chatroom } from './client.proof';

const coreChatroomFields = selectorBuilder<Chatroom>().select((chatroom) => [
  chatroom.id,
  chatroom.name,
  chatroom.users((user) => [user.id, user.username]),
  chatroom.messages((message) => [
    message.timestamp,
    message.sender((user) => [user.id, user.username]),
    message.mentioned((user) => [user.id, user.username]),
    message.text,
  ]),
]);

interface CoreChatroom {
  id: number;
  name: string;
  messages: {
    timestamp: string;
    mentioned: { id: number; username: string } | null;
    sender: { id: number; username: string };
    text: string;
  }[];
  users: { id: number; username: string }[];
}

describe('selectorBuilder', () => {
  it('should return an object with virtual `infer` methods for type inference', () => {
    expect(coreChatroomFields.infer).to(equal<CoreChatroom>);
    expect(coreChatroomFields.inferAsNullable).to(equal<CoreChatroom | null>);
    expect(coreChatroomFields.inferAsList).to(equal<CoreChatroom[]>);
    expect(coreChatroomFields.inferAsListNullable).to(equal<(CoreChatroom | null)[]>);
    expect(coreChatroomFields.inferAsNullableList).to(equal<CoreChatroom[] | null>);
    expect(coreChatroomFields.inferAsNullableListNullable).to(
      equal<(CoreChatroom | null)[] | null>,
    );
  });
});
