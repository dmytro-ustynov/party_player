from datetime import datetime
from pymongo import MongoClient, DESCENDING, ASCENDING
from pymongo.errors import ServerSelectionTimeoutError
from decouple import config as ENV


VARIABLES = ("DB_HOST", "DB_PORT", "DB_NAME",
             "DB_USERNAME", "DB_PASSWORD",
             "DB_COLLECTIONS")

CONFIG = {e: ENV(e, e) for e in VARIABLES}


class MongoManagerValidationError(Exception):
    pass


class MongoManager:
    def __init__(self, config=None, **kwargs):
        config = config or CONFIG
        host = config.get('DB_HOST', 'localhost')
        port = config.get('DB_PORT', 27017)
        db_name = config.get('DB_NAME')
        user = config.get('DB_USERNAME')
        password = config.get('DB_PASSWORD')
        collection_names = [c.strip() for c in config.get('DB_COLLECTIONS', 'users').split(',')]
        # collection_names = ['users']
        connection_line = f'mongodb://{user}:{password}@{host}:{port}'
        self._client = MongoClient(connection_line)
        try:
            _ = self._client.server_info()
            self.connected = True
        except TimeoutError:
            self.connected = False
        except ServerSelectionTimeoutError:
            self.connected = False
        except Exception as e:
            self.connected = False
            print("ERROR! ")
            print(str(e))
        if not self.connected:
            print('DATABASE NOT FOUND')
        self._db = self._client.get_database(db_name) if self.connected else None
        self._collections = {}
        for name in collection_names:
            _collection = self._db.get_collection(name) if self.connected else None
            if _collection is not None:
                self._collections[name] = _collection
        if not self._collections:
            print('WARNING! no collections')

    def _get_collection(self, collection_name):
        if collection_name in self._collections:
            return self._collections[collection_name]
        else:
            print('WARNING: collection not found: "{}"'.format(collection_name))
            return None

    def insert_one(self, data, collection=None):
        collection = self._get_collection(collection)
        if collection is not None:
            _id = collection.insert_one(data).inserted_id
            return _id

    def get(self, filters, collection=None):
        collection = self._get_collection(collection)
        if collection is not None and filters:
            return collection.find_one(filters)

    def update(self, filter, payload, collection=None, operation='$set'):
        """
        Finds a single document and updates it, returning either the
        original or the updated document.

          >>> db.test.update(
          ...    {'_id': 665}, {'$inc': {'count': 1}, '$set': {'done': True}})
          {u'_id': 665, u'done': False, u'count': 25}}

        Returns ``None`` if no document matches the filter.
        :param filter:
        :param payload:
        :param collection:
        :param operation:
        :return:
        """
        collection = self._get_collection(collection)
        if collection is not None:
            return collection.find_one_and_update(filter, {operation: payload})

    def find(self, filters, collection=None, **kwargs):
        collection = self._get_collection(collection)
        if collection is not None:
            return collection.find(filters, **kwargs)

    def delete(self, filters, collection=None, **kwargs):
        collection = self._get_collection(collection)
        if collection is not None:
            return collection.remove(filters, **kwargs)

    def query(self, cls):
        return MongoQuery(db=self, cls=cls)


class MongoQuery:
    def __init__(self, db, cls):
        self._db_manager = db
        self.cls = cls
        self._collection = cls.__collection__

    def find(self, filters, **kwargs):
        if 'sort' in kwargs:
            kwargs['sort'] = self.create_sort_payload(kwargs)
        # todo: maybe return as instances of the self.cls()?
        return self._db_manager.find(filters=filters, collection=self._collection, **kwargs)

    def get(self, *args, **kwargs):
        self._validate_filters(kwargs)
        data = self._db_manager.get(*args, filters=kwargs, collection=self._collection)
        if data:
            return self.cls(**data)

    def update(self, filters, payload):
        if 'updated_at' not in payload:
            payload['updated_at'] = datetime.now()
        return self._db_manager.update(filters, payload, collection=self._collection)

    def create(self, payload):
        """
        Return id of the newly inserted payload to the collection
        :param payload:
        :return:
        """
        if 'created_at' not in payload:
            now = datetime.now()
            payload['created_at'] = now
            payload['updated_at'] = now
        return self._db_manager.insert_one(payload, collection=self._collection)

    def delete(self, *args, **kwargs):
        return self._db_manager.delete(filters=kwargs, collection=self._collection)

    @staticmethod
    def create_sort_payload(data):
        # sort=[('created_at', 'desc')]
        sort_data = list()
        for key, order in data.get('sort'):
            mongo_order = DESCENDING if order.lower() in ('desc', -1) else ASCENDING
            sort_data.append((key, mongo_order))
        return sort_data

    def _validate_filters(self, filters):
        for k in filters.keys():
            if k not in self.cls.__slots__:
                raise MongoManagerValidationError(f'no such attribute in class {self.cls.__name__}: {k}')
