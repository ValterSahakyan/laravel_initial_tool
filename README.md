1. Install the latest `NPM`:
   
        npm install --global npm@latest


2. To install `Composer` globally, download the installer from https://getcomposer.org/download/ Verify that Composer in successfully installed, and version of installed Composer will appear:
   
        composer --version


3. Install `Composer` dependencies.
   
        composer install


4. Install `NPM` dependencies.
   
        npm install


5. The below command will compile all the assets(sass, js, media) to public folder:
   
        npm run dev


6. Copy `.env.example` file and create duplicate. Use `cp` command for Linux or Max user.

        cp .env.example .env

    If you are using `Windows`, use `copy` instead of `cp`.
   
        copy .env.example .env
   
7. Create a table in MySQL database and fill the database details `DB_DATABASE` in `.env` file.

8. The below command will create tables into database using Laravel migration and seeder.

        php artisan migrate:fresh --seed

9. Generate your application encryption key:

        php artisan key:generate


10. Start the localhost server:
    
        php artisan serve
