# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html


from scrapy.item import Item, Field


class StackItem(Item):
    # define the fields for your item here:
    name = Field()
    address = Field()
    city = Field()
    state = Field()
    zip_code = Field()