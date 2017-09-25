
import config from './config';
import pool from "./sql";
import jwt from "jsonwebtoken";
export default {

booksByAuth(query)
{
return new Promise((resolve,reject)=>{
	//console.log(pool);
	pool.getConnection(function(err, connection) {
		connection.query('SELECT * FROM library WHERE author = "'+query+'"', function (error, results, fields) {
		  connection.release();
		  if (error) reject(error);
	   console.log(JSON.stringify(results));
	   resolve(JSON.stringify(results));
		 });
	  });
})
},

bookById(id)
{
return new Promise((resolve,reject)=>{
		
	pool.getConnection(function(err, connection) {
		connection.query('SELECT * FROM library JOIN books ON library.id = books.type WHERE  books.id = '+id+'', function (error, results, fields) {
		  connection.release();
		  if (error) reject(error);
	   console.log(JSON.stringify(results));
	   resolve(JSON.stringify(results));
		 });
	  });
})	
},

bookByType(bookarray,type)
{
	return new Promise((resolve,reject)=>{
		pool.getConnection(function(err, connection) {
			connection.query('SELECT * FROM books WHERE type = '+type+' AND student IS NULL', function (error, results, fields) {
			  connection.release();
			  if (error) reject(error);
		   console.log(JSON.stringify(results));
		   resolve(JSON.stringify(results));
			 });
			});
		  });
},

allBooks(libraryarray)
{
	return new Promise((resolve,reject)=>{

		pool.getConnection(function(err, connection) {
			connection.query('SELECT * FROM library', function (error, results, fields) {
			  connection.release();
			  if (error) reject(error);
		   console.log(JSON.stringify(results));
		   resolve(JSON.stringify(results));
			 });
		  });
})
},
bookReturn(id)
{
	return new Promise((resolve,reject)=>{
		pool.getConnection(function(err, connection) {
			connection.query('CALL book_return('+id+')', function (error, results, fields) {
			  connection.release();
			  if (error) reject(error);
		   console.log(JSON.stringify(results[0][0].dates));
		   if((Date.now()-results[0][0].dates)/60*60*1000*24>=31)
		   resolve(JSON.stringify(results[0][0].dates));
			 });
		  });
})
},
bookIssue(id,studentid)
{	//console.log(libraryarray,bookarray,id,studentid);
	return new Promise((resolve,reject)=>{
		
		pool.getConnection(function(err, connection) {
			connection.query('CALL book_issue('+id+','+Date.now()+','+studentid+')', function (error, results, fields) {
			  
			  if (error) reject(error);

		   console.log(JSON.stringify(results));
		   resolve('book issue');
		   connection.release();	 
		});
		
		  });
	});
},
createStudent(name,uname,pass)
{

	return new Promise((resolve,reject)=>{
		pool.getConnection(function(err, connection) {
			connection.query('INSERT INTO books (username,fullname,password) VALUES ("'+uname+'","'+name+'","'+password+'")', function (error, results, fields) {
			  connection.release();
			  if (error) reject(error);
		   resolve(JSON.stringify(results[0][0].dates));
			 });
		  });
})		
},
studentLogin(username,password){
	return new Promise((resolve,reject)=>{
		pool.getConnection(function(err, connection) {
			connection.query('SELECT * FROM student WHERE username ='+username+'', function (error, results, fields)
			 {
			  connection.release();
			  if (error) reject(error);
			  if(results.length<1);
			  resolve("user not found");
			  if(results[0].password!=password)
			  resolve("password is incorrect");
			  let tokn = jwt.sign({
				username 
			  }, config.secret, { expiresIn: '1h' });
			  resolve(results[0].fullname+"is logged in with token"+tokn);
			}); 
			});
		  });
},
libraryLogin(username,password)
{
return new Promise((resolve,reject)=>{
 	if(username!=config.adminusername)
 	resolve('wrong username');
 	if(password!=config.adminpassword)
 	resolve('wrong password');
 	let tokn = jwt.sign({
 		username 
 	  }, config.secret, { expiresIn: '1h' });
 	  resolve(username+"is logged in with token"+tokn);
	
 });
 },
 createBook(title,author,number)
 {
	return new Promise((resolve,reject)=>{
		pool.getConnection(function(err, connection) {
			connection.query("SELECT * FROM library WHERE title='"+title+"' AND author='"+author+"'", function (error, results, fields)
			 {
			  if (error) reject(error);
			  if(results.length>0);
			  {
				  
			  }
			  if(results[0].password!=password)
			  resolve("password is incorrect");
			  let tokn = jwt.sign({
				username 
			  }, config.secret, { expiresIn: '1h' });
			  resolve(results[0].fullname+"is logged in with token"+tokn);
			}); 
			});
		  });
 }
}