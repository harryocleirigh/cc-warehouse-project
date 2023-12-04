import os
from flask import Flask, jsonify, request
from collections import Counter
import psycopg2
from flask_cors import CORS
from dotenv import load_dotenv
import logging

# Instantiate the flask app, enable CORS, and get ENV variables from Docker
app = Flask(__name__)
CORS(app)
load_dotenv()

# Set up logging
logger = logging.getLogger('werkzeug')

# Cache the results of the queries
diabetes_age_cache = {}
diabetes_bmi_cache = {}
heart_gender_cache = {}
heart_symptoms_cache = {}
breast_cancer_cache = {}

# Connect to Redshift using the ENV variables
def connect_redshift():

    print("Connecting to Redshift... 🤞")

    try:
        conn = psycopg2.connect(
            dbname=os.getenv('DB_NAME'),   
            user=os.getenv('DB_USER'), 
            password=os.getenv('DB_PASSWORD'), 
            host=os.getenv('DB_HOST'), 
            port=os.getenv('DB_PORT')
        )

        return conn
    
    except Exception as e:
        print("Failed to connect to Redshift: " + str(e))
        return None

# Define the routes
# The index route is used to check if the connection to Redshift is working
@app.route('/')
def index():
    logger.info("Attempting to connect to Redshift... 🤞")
    conn = connect_redshift()
    if conn is None:
        return jsonify({"error": "Connection to Redshift failed."}), 500
    else:
        logger.info("Connection to Redshift successful 🚀")
        return jsonify({"message": "Connection to Redshift successful."}), 200

# API for getting diabetes age related data
@app.route('/diabetes/age')
def get_diabetes_age():

    # Retrieve the age range from query parameters
    age_range = request.args.get('age_range', default='all', type=str)

    # Check cache first
    if age_range in diabetes_age_cache:
        logger.info("Cache hit! -> returning cached result ✨")
        return jsonify(diabetes_age_cache[age_range])
    
    conn = connect_redshift()

    if conn is None:
        return jsonify({"error": "Connection to Redshift failed."}), 500

    cursor = conn.cursor()

    try:
        query = """
        SELECT 
            gender
        FROM 
            diabetes 
        WHERE 
            diabetes = 1
        """

        if age_range == 'under30':
            query += "AND age < 30 "
        elif age_range == '30to60':
            query += "AND age BETWEEN 30 AND 60 "
        elif age_range == 'over60':
            query += "AND age > 60 "
        elif age_range == 'all':
            pass

        query += "LIMIT 50;"

        cursor.execute(query)
        rows = cursor.fetchall()

        flattened_rows = [row[0] for row in rows]
        gender_counts = Counter(flattened_rows)
        diabetes_age_cache[age_range] = gender_counts

        cursor.close()
        conn.close()

        return jsonify(gender_counts)

    except Exception as e:
        cursor.close()
        conn.close()
        return str(e), 500

# API for getting diabetes bmi related data
@app.route('/diabetes/bmi')
def get_diabetes_bmi():
    sex_range = request.args.get('sex_range', default='all', type=str)

    if sex_range in diabetes_bmi_cache:
        logger.info("Cache hit! -> returning cached result ✨")
        return jsonify(diabetes_bmi_cache[sex_range])
    
    conn = connect_redshift()

    if conn is None:
        return jsonify({"error": "Connection to Redshift failed."}), 500

    cursor = conn.cursor()

    query = """
        SELECT 
            bmi_category,
            gender,
            COUNT(*) AS count
        FROM (
            SELECT 
                CASE
                    WHEN bmi < 16.0 THEN 'Underweight (Severe thinness)'
                    WHEN bmi BETWEEN 16.0 AND 16.9 THEN 'Underweight (Moderate thinness)'
                    WHEN bmi BETWEEN 17.0 AND 18.4 THEN 'Underweight (Mild thinness)'
                    WHEN bmi BETWEEN 18.5 AND 24.9 THEN 'Normal range'
                    WHEN bmi BETWEEN 25.0 AND 29.9 THEN 'Overweight (Pre-obese)'
                    WHEN bmi BETWEEN 30.0 AND 34.9 THEN 'Obese (Class I)'
                    WHEN bmi BETWEEN 35.0 AND 39.9 THEN 'Obese (Class II)'
                    ELSE 'Obese (Class III)'
                END AS bmi_category,
                gender
            FROM 
                diabetes
            WHERE 
                ('all' = %s OR gender = %s)
            LIMIT 100
        ) AS sub
        GROUP BY 
            bmi_category, gender
        ORDER BY 
            bmi_category, gender;
    """
    cursor.execute(query, (sex_range, sex_range))

    rows = cursor.fetchall()
    bmi_data = {row[0]: row[2] for row in rows}

    # Cache the result
    diabetes_bmi_cache[sex_range] = bmi_data
    
    cursor.close()
    conn.close()

    return jsonify(bmi_data)

# API for getting heart gender related data
@app.route('/heart/gender')
def get_heart_gender():

    age_range = request.args.get('age_range', default='all', type=str)

    if age_range in heart_gender_cache:
        logger.info("Cache hit! -> returning cached result ✨")
        return jsonify(heart_gender_cache[age_range])

    
    conn = connect_redshift()

    if conn is None:
        return jsonify({"error": "Connection to Redshift failed."}), 500

    cursor = conn.cursor()

    try:
        query = """
        SELECT 
            sex
        FROM 
            heart 
        WHERE 
            output = 1
        """

        if age_range == 'under30':
            query += "AND age < 30 "
        elif age_range == '30to60':
            query += "AND age BETWEEN 30 AND 60 "
        elif age_range == 'over60':
            query += "AND age > 60 "
        elif age_range == 'all':
            pass

        query += "LIMIT 50;"

        cursor.execute(query)
        rows = cursor.fetchall()

        label_mapping = {1: 'Male', 0: 'Female'}
        labeled_rows = [label_mapping.get(row[0], 'Unknown') for row in rows]

        gender_counts = Counter(labeled_rows)

        # Cache the result
        heart_gender_cache[age_range] = gender_counts

        cursor.close()
        conn.close()

        return jsonify(gender_counts)

    except Exception as e:
        cursor.close()
        conn.close()
        return str(e), 500
    
# API for getting heart symptom related data
@app.route('/heart/symptoms')
def get_heart_age_range():

    sex_range = request.args.get('sex_range', default='all', type=str)

    if sex_range in heart_symptoms_cache:
        logger.info("Cache hit! -> returning cached result ✨")
        return jsonify(heart_symptoms_cache[sex_range])

    conn = connect_redshift()

    if conn is None:
        return jsonify({"error": "Connection to Redshift failed."}), 500
    
    cursor = conn.cursor()

    try:
        query = """
        SELECT 
            cp_category,
            COUNT(*) AS count
        FROM (
            SELECT 
                CASE
                    WHEN cp = 0 THEN 'Typical angina'
                    WHEN cp = 1 THEN 'Atypical angina'
                    WHEN cp = 2 THEN 'Non-anginal pain'
                    WHEN cp = 3 THEN 'Asymptomatic'
                    ELSE 'Unknown'
                END AS cp_category
            FROM 
                heart
            WHERE 
                %s = 'all' OR sex = CAST(%s AS INTEGER)
            LIMIT 100
        ) AS subquery
        GROUP BY 
            cp_category;
        """

        cursor.execute(query, (sex_range, sex_range if sex_range != 'all' else '1'))
        rows = cursor.fetchall()

        # Convert the rows into a dictionary
        symptoms_count = {row[0]: row[1] for row in rows}

        # Cache the result
        heart_symptoms_cache[sex_range] = symptoms_count

        cursor.close()
        conn.close()

        return jsonify(symptoms_count)

    except Exception as e:
        cursor.close()
        conn.close()
        return str(e), 500

# API for getting breast cancer related data
@app.route('/breastcancer/stage')
def get_breast_cancer_death():
    stage_range = request.args.get('stage_range', default='all', type=str)

    if stage_range in breast_cancer_cache:
        logger.info("Cache hit! -> returning cached result ✨")
        return jsonify(breast_cancer_cache[stage_range])
    
    conn = connect_redshift()

    if conn is None:
        return jsonify({"error": "Connection to Redshift failed."}), 500
    
    cursor = conn.cursor()

    try:
        where_clause = "WHERE Status = 'Dead'"
        params = []
        if stage_range != 'all':
            where_clause += " AND \"T Stage\" = %s"  
            params.append(stage_range)

        query = f"""
        SELECT 
            Age_Bin,
            COUNT(*) AS Count
        FROM (
            SELECT 
                CASE
                    WHEN Age >= 30 AND Age < 40 THEN '30-39'
                    WHEN Age >= 40 AND Age < 50 THEN '40-49'
                    WHEN Age >= 50 AND Age < 60 THEN '50-59'
                    WHEN Age >= 60 AND Age < 70 THEN '60-69'
                    ELSE 'Other'
                END AS Age_Bin
            FROM 
                breastcancer
            {where_clause}
            LIMIT 100  
        ) AS AgeBins
        GROUP BY 
            Age_Bin
        ORDER BY 
            Age_Bin;
        """
        
        cursor.execute(query, tuple(params))  

        rows = cursor.fetchall()
        age_count = {row[0]: row[1] for row in rows}
        breast_cancer_cache[stage_range] = age_count

        cursor.close()
        conn.close()

        return jsonify(age_count)

    except Exception as e:
        cursor.close()
        conn.close()
        return str(e), 500

# Run the app
if __name__ == '__main__':
    app.run(debug=True)