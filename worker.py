#!/usr/bin/python2.7
# -*- coding: utf-8 -*-



try:
    import cPickle as pickle
except:
    import pickle

from scrapy.q import Queue
from models.top_user import User
from models.buyer import Buyer
from models.shop import Shop

from scrapy.top.tasks import UserTradeInitTask, UserTradeUpdateTask, CustomerUpdateTask
import time

import signal
import logging

class Worker:

    def __init__(self, queue_instance):
        self.queue = queue_instance
        self.running = True
        self.set_logging()
        self.handle_signal()
        
    def set_logging(self):
        logging.basicConfig(filename='log/worker.log',
                            filemode='a',
                            format='[%(levelname)-5s %(asctime)s %(msecs)6dms]  %(message)s ',
                            datefmt='%Y%m%d %H:%M:%S',
                            level=logging.DEBUG)
        
        self.logger = logging.getLogger(__name__)

    def handle_signal(self):
        for sig in (signal.SIGABRT, signal.SIGILL, signal.SIGINT, signal.SIGSEGV, signal.SIGTERM):
            signal.signal(sig, self.stop_signal_do)

    def stop_signal_do(self, sig, frm):
        self.running = False

    def work(self, queue_name):
        while self.running:
            data = self.queue.get(queue_name)
            if data:
                job = pickle.loads(data[1])
                job()
                self.logger.info("(%s):%s" %(data[0], job.name))

    def works(self, *queues):
        while self.running:
            data = self.queue.dequeue(queues, timeout = 2)
            if data:
                job = pickle.loads(data[1])
                job()
                self.logger.info("(%s):%s" %(data[0], job.name))
                


if __name__ == "__main__":
    print "...worker starting...... "
    q = Queue("demo_queues", host="localhost", db=0, port=6379)
    queues = ["high", "meduim", "low"]

    worker = Worker(q)
    worker.works(*queues)
    print "...worker exit........"
