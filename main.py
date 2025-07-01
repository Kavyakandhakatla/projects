import datetime
import re

from flask import Flask, request, render_template, session, redirect
import pymongo
from bson import objectid, ObjectId

my_client = pymongo.MongoClient("mongodb://localhost:27017/")
my_db = my_client["Seasonal_sweep_solutions"]
locations_collection = my_db['locations']
customers_collection = my_db['customers']
service_providers_collection = my_db['service_providers']
services_collection= my_db['services']
service_request_collection = my_db['service_request']
reviews_collection =my_db['reviews']
payment_collection = my_db['payments']
import os
APP_ROOT = os.path.dirname(os.path.abspath(__file__))


# APP_ROOT = APP_ROOT+'/static/images'


app = Flask(__name__)
app.secret_key = "Snow"


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/index1")
def index1():
    return render_template("index1.html")


@app.route("/admin_login")
def admin_login():
    return render_template("admin_login.html")


@app.route("/admin_login_action", methods=['post'])
def admin_login_action():
    username = request.form.get("username")
    password = request.form.get("password")
    if username == 'admin' and password == 'admin':
        session['role'] = 'admin'
        return redirect("/admin_home")
    else:
        return render_template("message.html", message="Invalid Login Details")


@app.route("/admin_home")
def admin_home():
    return render_template("admin_home.html")

@app.route("/customer_login")
def customer_login():
    return render_template("customer_login.html")


@app.route("/customer_login_action", methods=['post'])
def customer_login_action():
    email = request.form.get("email")
    password = request.form.get("password")
    query = {"email": email, "password": password}
    count = customers_collection.count_documents(query)
    if count > 0:
        customer = customers_collection.find_one(query)
        session['customer_id'] = str(customer['_id'])
        session["role"] = 'customer'
        return redirect("/customer_home")
    else:
        return render_template("message.html", message="invalid login")


@app.route("/customer_home")
def customer_home():
    return render_template("customer_home.html")


@app.route("/customer_registration")
def customer_registration():
    locations = locations_collection.find()
    locations = list(locations)
    return render_template("customer_registration.html", locations=locations)


@app.route("/customer_registration_action", methods=['post'])
def customer_registration_action():
    first_name = request.form.get("first_name")
    last_name = request.form.get("last_name")
    phone = request.form.get("phone")
    email = request.form.get("email")
    password = request.form.get("password")
    address = request.form.get("address")
    city = request.form.get("city")
    state = request.form.get("state")
    zipcode = request.form.get("zipcode")
    query = {'$or': [{"email": email}, {'phone': phone}]}
    count = customers_collection.count_documents(query)
    if count == 0:
        query = {"first_name": first_name, "last_name": last_name,"city": city,"state": state, "zipcode": zipcode, "email": email, "phone": phone, "password": password, "address": address}
        customers_collection.insert_one(query)
        return render_template("message.html", message="Customer Registered Successfully")
    else:
        return render_template("message.html", message="Duplicate Details")


@app.route("/service_provider_login")
def service_provider_login():
    return render_template("service_provider_login.html")


@app.route("/service_provider_login_action", methods=['post'])
def service_provider_login_action():
    email = request.form.get("email")
    password = request.form.get("password")
    query = {"email": email, "password": password}
    count = service_providers_collection.count_documents(query)
    if count > 0:
        service_provider = service_providers_collection.find_one(query)
        if service_provider['status'] == 'Authorised':
            session["service_provider_id"] = str(service_provider['_id'])
            session["role"] = 'service_provider'
            return redirect("/service_provider_home")
        else:
            return render_template("message.html", message="Service provider is Unauthorised")
    else:
        return render_template("message.html", message="invalid login")


@app.route("/service_provider_home")
def service_provider_home():
    return render_template("service_provider_home.html")


@app.route("/service_provider_registration")
def service_provider_registration():
    locations = locations_collection.find()
    return render_template("service_provider_registration.html", locations=locations)


@app.route("/service_provider_registration_action", methods=['post'])
def service_provider_registration_action():
    location_id = request.form.get("location_id")
    first_name = request.form.get("first_name")
    last_name = request.form.get("last_name")
    phone = request.form.get("phone")
    email = request.form.get("email")
    password = request.form.get("password")
    state = request.form.get("state")
    company_name = request.form.get("company_name")
    city = request.form.get("city")
    zipcode = request.form.get("zipcode")
    query = {'$or': [{"email": email}, {'phone': phone}]}
    count = service_providers_collection.count_documents(query)
    if count == 0:
        query = {"first_name": first_name, "last_name": last_name, "city": city, "zipcode": zipcode, "company_name": company_name, "phone": phone, "email": email, "password": password,"state": state, "status": 'Unauthorized', 'location_id': ObjectId(location_id)}
        service_providers_collection.insert_one(query)
        return render_template("message.html", message="Service Provider registered successfully")
    else:
        return render_template("message.html", message="Duplicate Data Entry")

@app.route("/add_locations")
def add_locations():
    locations = locations_collection.find()
    return render_template("add_locations.html", locations=locations)

@app.route("/add_location_action", methods=['post'])
def add_location_action():
    location_name = request.form.get("location_name")
    zipcode = request.form.get("zipcode")
    query = {"location_name": location_name}
    count = locations_collection.count_documents(query)
    if count == 0:
        query = {"location_name": location_name,"zipcode": zipcode}
        locations_collection.insert_one(query)
        return redirect("/add_locations")
    else:
        return render_template("msg2.html", message="Location already exist")

@app.route("/view_service_providers")
def service_providers():
    service_providers = service_providers_collection.find()
    return render_template("view_service_providers.html", service_providers=service_providers, get_location_by_location_id=get_location_by_location_id)


def get_location_by_location_id(location_id):
    query = {"_id": ObjectId(location_id)}
    location = locations_collection.find_one(query)
    return location

@app.route("/update_status")
def update_status():
    status = request.args.get("status")
    service_provider_id = request.args.get("service_provider_id")
    query1 = {"_id": ObjectId(service_provider_id)}
    query2 = {"$set": {"status": status}}
    service_providers_collection.update_one(query1, query2)
    return redirect("/view_service_providers")


@app.route("/add_service")
def add_service():
    locations = locations_collection.find()
    return render_template("add_service.html", locations=locations)


@app.route("/add_service_action", methods=['post'])
def add_service1():
    location_id = request.form.get("location_id")
    charge_for_square_feet = request.form.get("charge_for_square_feet")
    service_title = request.form.get("service_title")
    picture = request.files.get("picture")
    if picture:
        path = APP_ROOT + "/static/Pictures/" + picture.filename
        picture.save(path)
    else:
        return render_template("msg2.html", message="Please upload a Picture.")
    description = request.form.get("description")
    query = {"service_title": service_title}
    count = services_collection.count_documents(query)
    if count == 0:
        query = {"location_id": ObjectId(location_id), "service_title": service_title, "charge_for_square_feet": charge_for_square_feet, "picture": picture.filename, "description": description}
        services_collection.insert_one(query)
        return redirect("/view_services")
    else:
        return render_template("message.html", message="Service already exist")


@app.route("/view_services")
def view_services():
    query = {}
    location_id = request.args.get("location_id")
    print(location_id)
    msg = request.args.get("msg")
    if location_id == None:
        location_id = ""
    if location_id != '':
        query = {"location_id": ObjectId(location_id)}
    elif location_id == '':
        query = {}
    services = services_collection.find(query)
    locations = locations_collection.find()
    locations = list(locations)
    services = list(services)
    return render_template("view_services.html", get_location_by_location_id=get_location_by_location_id, str=str, locations=locations, services=services, get_service_request_by_service_id=get_service_request_by_service_id)

def get_service_request_by_service_id(service_id):
    query = {"service_id": ObjectId(service_id), "customer_id": ObjectId(session["customer_id"])}
    service_request = service_request_collection.find_one()
    return service_request


@app.route("/send_request")
def send_request():
    from_date_time = request.args.get('from_date_time')
    to_date_time = request.args.get('to_date_time')
    if from_date_time == None:
        from_date_time = datetime.datetime.now()
        to_date_time = from_date_time + datetime.timedelta(minutes=60)
        from_date_time = from_date_time.strftime("%Y-%m-%dT%H:%M")
        to_date_time = to_date_time.strftime("%Y-%m-%dT%H:%M")
    service_id = request.args.get("service_id")
    service = services_collection.find_one({"_id": ObjectId(service_id)})
    charge_for_square_feet = request.args.get("charge_for_square_feet")
    service_providers = service_providers_collection.find()
    service_providers = list(service_providers)
    print(service_providers)
    return render_template("send_request.html", to_date_time=to_date_time, from_date_time=from_date_time, service_providers=service_providers, service_id=service_id, charge_for_square_feet=charge_for_square_feet, is_service_provider_available=is_service_provider_available)


@app.route("/send_request_action")
def send_request_action():
    from_date_time = request.args.get("from_date_time")
    to_date_time = request.args.get("to_date_time")
    from_date_time = datetime.datetime.strptime(from_date_time, "%Y-%m-%dT%H:%M")
    to_date_time = datetime.datetime.strptime(to_date_time, "%Y-%m-%dT%H:%M")
    service_id = request.args.get("service_id")
    service_provider_id = request.args.get("service_provider_id")
    customer_id = ObjectId(session["customer_id"])
    charge_for_square_feet = request.args.get("charge_for_sq_feet")
    date = datetime.datetime.now()
    date = datetime.datetime.strftime(date, "%Y-%m-%d %H:%M")
    query = {"service_id": ObjectId(service_id), "customer_id": ObjectId(customer_id),"from_date_time":from_date_time, "to_date_time":to_date_time, "request_on": date, "status": 'Requested', "service_provider_id": ObjectId(service_provider_id)}
    service_request_collection.insert_one(query)
    return render_template("customer_msg.html", message="Request Sent Successfully")

def is_service_provider_available(service_id, service_provider_id, from_date_time, to_date_time):
    from_date_time = datetime.datetime.strptime(from_date_time, "%Y-%m-%dT%H:%M")
    to_date_time = datetime.datetime.strptime(to_date_time, "%Y-%m-%dT%H:%M")
    query = {"$or": [{"from_date_time": {"$gte": from_date_time, "$lte": to_date_time},
                      "to_date_time": {"$gte": from_date_time, "$gte": to_date_time},
                      "status": {"$nin": ['Requested', 'Rejected', 'Service Completed', 'Review Given', 'Completed', 'Payment Done']}, "service_id": ObjectId(service_id),
                      "service_provider_id": ObjectId(service_provider_id)},
                     {"from_date_time": {"$lte": from_date_time, "$lte": to_date_time},
                      "to_date_time": {"$gte": from_date_time, "$lte": to_date_time},
                      "status": {"$nin": ['Requested', 'Rejected', 'Service Completed', 'Review Given', 'Completed', 'Payment Done']}, "service_id": ObjectId(service_id),
                      "service_provider_id": ObjectId(service_provider_id)},
                     {"from_date_time": {"$lte": from_date_time, "$lte": to_date_time},
                      "to_date_time": {"$gte": from_date_time, "$gte": to_date_time},
                      "status": {"$nin": ['Requested', 'Rejected', 'Service Completed', 'Review Given', 'Completed', 'Payment Done']}, "service_id": ObjectId(service_id),
                      "service_provider_id": ObjectId(service_provider_id)},
                     {"from_date_time": {"$gte": from_date_time, "$lte": to_date_time},
                      "to_date_time": {"$gte": from_date_time, "$lte": to_date_time},
                      "status": {"$nin": ['Requested', 'Rejected', 'Service Completed', 'Review Given', 'Completed', 'Payment Done']}, "service_id": ObjectId(service_id),
                      "service_provider_id": ObjectId(service_provider_id)},
                     ]}
    count = service_request_collection.count_documents(query)
    if count > 0:
        return True
    else:
        return False


@app.route("/reschedule")
def reschedule():
    service_request_id = request.args.get("service_request_id")
    return render_template("reschedule.html",service_request_id=service_request_id)


@app.route("/reschedule_request")
def reschedule_request():
    service_request_id = request.args.get("service_request_id")
    from_date_time = request.args.get("from_date_time")
    to_date_time = request.args.get("to_date_time")
    if not from_date_time or not to_date_time:
        return render_template("customer_msg.html", message="Invalid Date and Time")
    from_date_time = datetime.datetime.strptime(from_date_time, "%Y-%m-%dT%H:%M")
    to_date_time = datetime.datetime.strptime(to_date_time, "%Y-%m-%dT%H:%M")
    service_request_collection.update_one(
        {"_id": ObjectId(service_request_id)},
        {"$set": {"from_date_time": from_date_time, "to_date_time": to_date_time, "status": "Requested"}}
    )
    return render_template("customer_msg.html", message="Request Rescheduled Successfully")


@app.route("/view_requests")
def view_requests():
    no_of_square_feets = request.args.get("no_of_square_feets")
    if no_of_square_feets == None:
        no_of_square_feets = ''
    service_id = request.args.get("service_id")
    role = session['role']
    query = {}
    if role == 'service_provider':
        print(service_id)
        if service_id != None:
            statuses = ["Payment Done", "Review Given", "Cancelled"]
            query = {"service_id": ObjectId(service_id), "status": {"$nin": statuses}}
        else:
            statuses = ["Payment Done", "Review Given", "Cancelled"]
            query = {"service_provider_id": ObjectId(session["service_provider_id"]), "status": {"$nin": statuses}}
    elif role == 'customer':
        statuses = ["Payment Done", "Review Given", "Cancelled"]
        query = {"customer_id": ObjectId(session["customer_id"]), "status": {"$nin": statuses}}
        print(query)
    elif role == 'admin':
        query = {"service_id": ObjectId(service_id)}
    requests = service_request_collection.find(query)
    return render_template("view_requests.html", no_of_square_feets=no_of_square_feets, requests=requests, get_service_by_service_id=get_service_by_service_id, get_service_provider_by_service_provider_id=get_service_provider_by_service_provider_id, get_location_by_location_id=get_location_by_location_id, get_customer_by_customer_id=get_customer_by_customer_id, int=int, float=float)

def get_service_by_service_id(service_id):
    query = {"_id": ObjectId(service_id)}
    service = services_collection.find_one(query)
    return service


def get_service_provider_by_service_provider_id(service_provider_id):
    print(service_provider_id)
    query = {"_id": ObjectId(service_provider_id)}
    service_provider = service_providers_collection.find_one(query)
    return service_provider


def get_customer_by_customer_id(customer_id):
    query = {"_id": ObjectId(customer_id)}
    customer = customers_collection.find_one(query)
    return customer

@app.route("/view_history")
def view_history():
    role = session['role']
    query = ''
    if role == 'service_provider':
        statuses = ["Payment Done", "Review Given", "Cancelled"]
        query = {"service_provider_id": ObjectId(session["service_provider_id"]), "status": {"$in": statuses}}
        print(query)
    elif role == 'customer':
        statuses = ["Payment Done", "Review Given", "Cancelled"]
        query = {"customer_id": ObjectId(session["customer_id"]), "status": {"$in": statuses}}
    requests = service_request_collection.find(query)
    return render_template("view_requests.html", requests=requests, get_service_by_service_id=get_service_by_service_id, get_service_provider_by_service_provider_id=get_service_provider_by_service_provider_id, get_customer_by_customer_id=get_customer_by_customer_id, int=int, float=float, get_location_by_location_id=get_location_by_location_id)

@app.route("/update_request_status")
def update_request_status():
    status = request.args.get("status")
    service_request_id = request.args.get("service_request_id")
    query1 = {"_id": ObjectId(service_request_id)}
    query2 = {"$set": {"status": status}}
    service_request_collection.update_one(query1, query2)
    return redirect("/view_requests")

@app.route("/service_request_status")
def service_request_status():
    status = request.args.get("status")
    service_request_id = request.args.get("service_request_id")
    query1 = {"_id": ObjectId(service_request_id)}
    query2 = {"$set": {"status": status, "service_start_time": datetime.datetime.now()}}
    service_request_collection.update_one(query1, query2)
    return redirect("/view_requests")

@app.route("/update_work")
def update_work():
    service_request_id = request.args.get("service_request_id")
    square_feets_worked = request.args.get("square_feets_worked")
    status = request.args.get("status")
    query1 = {"_id": ObjectId(service_request_id)}
    query2 = {"$set": {"status": status, "square_feets_worked": square_feets_worked, "service_end_time": datetime.datetime.now()}}
    service_request_collection.update_one(query1, query2)
    return redirect("/view_requests")


@app.route("/pay_amount")
def pay_amount():
    amount = request.args.get("amount")
    service_request_id = request.args.get("service_request_id")
    return render_template("pay_amount.html", amount=amount, service_request_id=service_request_id)

@app.route("/pay_amount_action")
def pay_amount_action():
    customer_id = session['customer_id']
    service_request_id = request.args.get("service_request_id")
    card_type = request.args.get("card_type")
    card_number = request.args.get("card_number")
    card_holder_name = request.args.get("card_holder_name")
    cvv = request.args.get("cvv")
    status = 'Paid'
    expiry_date = request.args.get("expiry_date")
    date = datetime.datetime.now()
    date = datetime.datetime.strftime(date, "%Y-%m-%d %H:%M")

    amount = request.args.get("amount")
    query = {"customer_id": ObjectId(customer_id), "service_request_id": ObjectId(service_request_id), "card_type":card_type,
             "card_number":card_number,"card_holder_name":card_holder_name,"cvv":cvv,"expiry_date":expiry_date,"status":status,"date":date,"amount":amount}
    payment_collection.insert_one(query)
    service_request_id = request.args.get("service_request_id")
    query1 = {"_id": ObjectId(service_request_id)}
    query2 = {"$set": {"status":'Payment Done', "service_start_time": datetime.datetime.now()}}
    service_request_collection.update_one(query1, query2)
    return render_template("msg2.html",message="Payment Successful")


@app.route("/view_payment")
def view_payment():
    service_request_id = request.args.get("service_request_id")
    query = {"service_request_id": ObjectId(service_request_id)}
    payments = payment_collection.find(query)
    print(payments)
    return render_template("view_payment.html", payments=payments)


@app.route("/review_rating")
def review_rating():
    service_provider_id = request.args.get("service_provider_id")
    service_request_id = request.args.get("service_request_id")
    return render_template("review_rating.html", service_provider_id=service_provider_id, service_request_id=service_request_id)


@app.route("/review_rating_action", methods=['post'])
def review1():
    customer_id = session['customer_id']
    service_request_id = request.form.get("service_request_id")
    review = request.form.get("review")
    rating = request.form.get("rating")
    date = datetime.datetime.now()
    date = datetime.datetime.strftime(date, "%Y-%m-%d %H:%M")
    query = {"review": review, "rating": rating, "service_request_id": ObjectId(service_request_id), "customer_id": ObjectId(customer_id), "date":date}
    reviews_collection.insert_one(query)
    service_request_id = request.form.get("service_request_id")
    query1 = {"_id": ObjectId(service_request_id)}
    query2 = {"$set": {"status": "Review Given"}}
    service_request_collection.update_one(query1, query2)
    return redirect("/view_history")


@app.route("/view_review")
def view_review():
    service_request_id = request.args.get("service_request_id")
    print(service_request_id)
    query = {"service_request_id": ObjectId(service_request_id)}
    reviews = reviews_collection.find_one(query)
    return render_template("view_review.html", review=reviews)






app.run(debug=True)

