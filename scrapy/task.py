#!/usr/bin/python2.7
# -*- coding: utf-8 -*-


#!/usr/bin/python2.7
# -*- coding: utf-8 -*-


"""
Task demo
"""

class AbstarctTask:

    def __init__(self, name="Base Task"):
        self.name = name

    def do_task(self):
        raise NotImplementedError("Not implemention")

class Task(AbstarctTask):

    def __init__(self, message, name='Demo Task'):
        AbstarctTask.__init__(self, name)
        self.message = message

    def __call__(self):
        print self.message


class Speaker:

    def __init__(self, word):
        self._word = word

    def __call__(self):
        self.say()

    def say(self):
        print self._word