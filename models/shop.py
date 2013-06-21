from model import Model



class Shop(Model):

    def __init__(self):
        Model.__init__(self)

    @staticmethod
    def create(shop):
        stmt = "INSERT INTO shop(user_id, nick, sid, cid, title) VALUES(%s, %s, %s, %s, %s)"
        Model.execute(stmt, shop['user_id'],  shop['nick'], shop['sid'], shop['cid'], shop['title'])

