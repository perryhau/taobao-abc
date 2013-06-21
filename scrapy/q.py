#!/usr/bin/python2.7
# -*- coding: utf-8 -*-


import redis


class Queue:

    """Queue with Redis Backend"""
    def __init__(self, namespace='queue', **redis_kwargs):
        """The default connection parameters are: host='localhost', port=6379, db=0"""
        self._redis = redis.Redis(**redis_kwargs)
        self.namespace = namespace

    def key(self, queue_name):
        return self.namespace + ":" + queue_name

    def add_queue(self, queue_name):
        self._redis.sadd(self.namespace, self.key(queue_name))

    def enqueue(self, queue_name, data):
        self._redis.rpush(self.key(queue_name), data)

    def destory(self, queue_name):
        self._redis.delete(self.key(queue_name))
        self._redis.srem(self.namespace, self.key(queue_name))

    def length(self, queue_name):
        """Return the approximate size of the queue."""
        return self._redis.llen(self.key(queue_name))

    def is_empty(self, queue_name):
        """Return True if the queue is empty, False otherwise."""
        return self.length(queue_name) == 0

    def remove_job(self, queue_name, data):
        """remove """
        self._redis.lrem(self.key(queue_name), 0, data)

    def peek(self, queue_name):
        return self._redis.lrange(self.key(queue_name), 0, 0)

    def dequeue(self, queues, timeout=10):
        """queues-> [] queue name list type: list
        LPOP a value off of the first non-empty list named in the keys list.
        If none of the lists in keys has a value to LPOP, then block for timeout seconds, or until a value gets pushed on to one of the lists.
        If timeout is 0, then block indefinitely.
        """
        return self._redis.blpop([self.key(queue_name) for queue_name in queues], timeout)

    def put(self, queue_name, data):
        """Put item into the queue."""
        self._redis.rpush(self.key(queue_name), data)

    def get(self, queue_name):
        """Return and remove an item"""
        return self._redis.blpop(self.key(queue_name))

    def get(self, queue_name, timeout):
        """Return and remove an item"""
        return self._redis.blpop(self.key(queue_name), timeout)

    def get(self, queue_name, block=True, timeout=None):
        """Remove and return an item from the queue.

        If optional args block is true and timeout is None (the default), block
        if necessary until an item is available."""
        if block:
            data = self._redis.blpop(self.key(queue_name), timeout=timeout)
        else:
            data = self._redis.lpop(self.key(queue_name))
        return data

    def get_nowait(self, queue_name):
        """Equivalent to get(queue_name,block = False)."""
        return self.get(queue_name, block=False)