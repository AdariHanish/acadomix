import pymysql
import os

host = 'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com'
port = 4000
user = '2r32GhnXE46aPEJ.root'
password = 'c6JJgBGmkI6pYkWR'
database = 'test'

print("Connecting to TiDB...")
connection = pymysql.connect(
    host=host,
    port=port,
    user=user,
    password=password,
    database=database,
    ssl={'ssl': {}} # minimal ssl dict for pymysql to trigger ssl
)

print("Connected successfully!")
cursor = connection.cursor()

schemas = [
    """
    CREATE TABLE IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        college VARCHAR(255) NOT NULL,
        branch VARCHAR(255),
        project_domain VARCHAR(255),
        budget VARCHAR(100),
        deadline VARCHAR(100),
        phone VARCHAR(20) NOT NULL,
        message TEXT,
        status VARCHAR(50) DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        year_type VARCHAR(100),
        original_price DECIMAL(10, 2),
        market_price DECIMAL(10, 2),
        our_price DECIMAL(10, 2),
        features TEXT,
        is_popular BOOLEAN DEFAULT FALSE,
        is_trending BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_name VARCHAR(255) NOT NULL,
        college VARCHAR(255),
        phone VARCHAR(20),
        email VARCHAR(255),
        project_name VARCHAR(255),
        amount DECIMAL(10, 2),
        screenshot_data LONGTEXT,
        mime_type VARCHAR(100),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_name VARCHAR(255) NOT NULL,
        college_name VARCHAR(255),
        year_of_study VARCHAR(100),
        project_name VARCHAR(255),
        project_type VARCHAR(100),
        rating INT,
        experience TEXT,
        pricing_review TEXT,
        date DATE,
        is_approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS app_assets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        asset_name VARCHAR(100) NOT NULL UNIQUE,
        mime_type VARCHAR(100),
        data LONGTEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS site_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mini_project_price VARCHAR(100),
        major_project_price VARCHAR(100),
        custom_project_price VARCHAR(100),
        research_paper_price VARCHAR(100),
        plagiarism_removal_price VARCHAR(100),
        admin_password VARCHAR(255),
        security_question VARCHAR(255),
        security_answer VARCHAR(255)
    )
    """
]

print("Creating tables...")
for schema in schemas:
    cursor.execute(schema)
connection.commit()
print("Tables created successfully!")

# Add missing columns to site_settings table if they don't exist
columns = [
    ('company_tagline', "VARCHAR(255) DEFAULT 'Coding Your Ideas'"),
    ('office_location_text', "VARCHAR(255) DEFAULT '65-5-259, VUDA Colony, Vizag - 530011'"),
    ('office_location_link', "TEXT"),
    ('admin_phone', "VARCHAR(20) DEFAULT '9515192936'")
]

for col_name, col_type in columns:
    try:
        cursor.execute(f"ALTER TABLE site_settings ADD COLUMN {col_name} {col_type}")
        print(f"Column {col_name} added successfully.")
    except Exception as e:
        # Ignore column already exists error
        if 'Duplicate column name' not in str(e):
            print(f"Error adding column {col_name}: {e}")
connection.commit()

# Add missing columns to payments table if they don't exist
try:
    cursor.execute("ALTER TABLE payments ADD COLUMN college VARCHAR(255) AFTER student_name")
    print("Column college added successfully to payments.")
except Exception as e:
    if 'Duplicate column name' not in str(e):
        print(f"Error adding college column to payments: {e}")
connection.commit()

# Insert default settings if empty
cursor.execute("SELECT COUNT(*) FROM site_settings")
if cursor.fetchone()[0] == 0:
    print("Inserting default settings...")
    cursor.execute("""
        INSERT INTO site_settings (
            mini_project_price, major_project_price, custom_project_price,
            research_paper_price, plagiarism_removal_price, admin_password,
            security_question, security_answer, company_tagline,
            office_location_text, office_location_link, admin_phone
        ) VALUES (
            '1500', '4500', '4500', '3000', '500', '1234',
            'What is your nick name?', 'lovely', 'Coding Your Ideas',
            '65-5-259, VUDA Colony, Vizag - 530011',
            'https://maps.google.com/?q=VUDA+Colony+Visakhapatnam',
            '9515192936'
        )
    """)
    connection.commit()

# Check if projects exist, insert defaults if not
cursor.execute("SELECT COUNT(*) FROM projects")
if cursor.fetchone()[0] == 0:
    print("Inserting default projects...")
    projects = [
        ('Face Recognition System', 'Real-time face detection...', 'aiml', 'major', 8000, 6000, 4500, 'Real-time Detection,Database Storage', True, True),
        ('E-Commerce Website', 'Full-stack e-commerce...', 'website', 'major', 15000, 10000, 7000, 'Product Catalog,Shopping Cart', True, False)
    ]
    cursor.executemany("""
        INSERT INTO projects (title, description, category, year_type, original_price, market_price, our_price, features, is_popular, is_trending)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, projects)
    connection.commit()

cursor.close()
connection.close()
print("Database setup complete!")
