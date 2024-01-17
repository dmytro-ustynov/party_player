import redis
from decouple import config as env

REDIS_PASSWORD = env('REDIS_PASSWORD')
REDIS_DB = env('REDIS_DB')


class RedisManager:
    def __init__(self, host='localhost', port='6379', db=1, password=None):
        self.db = redis.StrictRedis(host, port, db, password)

    def _find(self, key_pattern, keys=False):
        count, results = self.db.scan(0, key_pattern, 1000)
        while count != 0:
            count, res = self.db.scan(count, key_pattern + "*", count + 1000)
            results += res
        return results if keys else len(results)

    def count(self, key_pattern):
        """
        Return count of found keys by its pattern in db
        :param key_pattern:
        :return: int
        """
        return self._find(key_pattern)

    def find(self, key_pattern):
        """
        Return keys by their key_pattern
        :param key_pattern:
        :return: list of found items [b'item1', b'item2' ...]
        """
        return self._find(key_pattern, keys=True)

    def set_item(self, key, data=None, **kwargs):
        if data is not None:
            mapping = data
        else:
            mapping = kwargs
        return self.db.hset(key, mapping=mapping)

    def get(self, key):
        result = self.db.hgetall(key)
        return {k.decode(): v.decode() for k, v in result.items()}

    def ttl(self, key):
        return self.db.ttl(key)

    def expire(self, key, seconds):
        return self.db.expire(key, seconds)
