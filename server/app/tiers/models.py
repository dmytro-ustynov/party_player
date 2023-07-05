from sqlalchemy import Column, String, Enum, Integer
from sqlalchemy.dialects.postgresql import ARRAY

from server.app.dal.database import Base


# DB model
class Tier(Base):
    __tablename__ = 'tier_descriptions'

    name = Column(Enum('anonymous', 'registered', 'premium', name='tiers'), primary_key=True, default='anonymous')
    max_files = Column(Integer)
    formats = Column(ARRAY(String))
    mic_length = Column(Integer)
    adv_ratio = Column(Integer)
    file_size = Column(Integer)

    def to_dict(self):
        return dict(name=self.name,
                    max_files=self.max_files,
                    file_size=self.file_size,
                    formats=self.formats,
                    mic_length=self.mic_length,
                    adv_ratio=self.adv_ratio)
