import scrapy
from stack.items import StackItem
import xmltodict
import requests
from opencage.geocoder import OpenCageGeocode
from dotenv import load_dotenv
import os

load_dotenv()

class StackSpider(scrapy.Spider):
    name = "stack"
    allowed_domains = ["wafflehouse.com"]
    site_map = xmltodict.parse(requests.get('https://locations.wafflehouse.com/sitemap-0.xml').text)
    start_urls = [url["loc"] for url in site_map["urlset"]["url"]][1:]
    
    
    def parse(self, response):
        item = StackItem()
        
        open_key = os.getenv('OPENCAGE_API_KEY')
        geocoder = OpenCageGeocode(open_key)
        
        name = response.xpath('//div[@class="css-1g87ek4"]/text()').get()
        address = response.xpath('//div[@class="css-8er82g"]/text()').get()
        
        # Extracting city, state, and ZIP separately
        city_lines = response.xpath('//div[@class="css-1v3vqke"]/text()').getall()
        city, comma, state, zip_code = [line.strip() for line in city_lines if line.strip()][:4]
        
        query = f'{address}, {city}, {state} {zip_code}'
        results = geocoder.geocode(query)
        
        item['name'] = name.strip() if name else None
        item['address'] = address.strip() if address else None
        item['city'] = city
        item['state'] = state
        item['zip_code'] = zip_code
        item['latitude'] = results[0]['geometry']['lat']
        item['longitude'] = results[0]['geometry']['lng']

        yield item