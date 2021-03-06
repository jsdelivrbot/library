
import config from './config';
import pool from "./sql";
import jwt from "jsonwebtoken";
export default {

booksByAuth(query)
{
return new Promise((resolve,reject)=>{
	if(!query)
	{
		resolve("invalid author name");
		return;
	}
	pool.getConnection(function(err, connection) {
		connection.query('SELECT * FROM library WHERE author = "'+query+'"', function (error, results, fields) {
		  connection.release();
		  if (error) reject(error);
	   console.log(JSON.stringify(results));
		 if(results.length>0)
		 resolve(results);
		 else
		 resolve("no book found with author name:"+query);
		 });
	  });
})
},

bookById(id)
{
return new Promise((resolve,reject)=>{
		
	pool.getConnection(function(err, connection) {
		connection.query('SELECT * FROM library JOIN books ON library.id = books.booktype WHERE books.id = '+id+'', function (error, results, fields) {
		  connection.release();
		  if (error) reject(error);
	   console.log(JSON.stringify(results));
		 if(results.length<1)
		 {resolve("no book found with id:"+id)}
		 resolve(results);
		 });
	  });
})	
},

bookByType(type)
{
	return new Promise((resolve,reject)=>{
		pool.getConnection(function(err, connection) {
			connection.query('SELECT * FROM books WHERE booktype = '+type+' AND student IS NULL', function (error, results, fields) {
			  connection.release();
			  if (error) reject(error);
			 console.log(JSON.stringify(results));
			 if(results.length<1)
			 resolve("no book found with type:"+type);
		   resolve(results);
			 });
			});
		  });
},

allBooks()
{
	return new Promise((resolve,reject)=>{

		pool.getConnection(function(err, connection) {
			connection.query('SELECT * FROM library', function (error, results, fields) {
			  connection.release();
			  if (error) reject(error);
		   console.log(JSON.stringify(results));
		   resolve(results);
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
		   resolve(JSON.stringify("you have fine of "+(Date.now()-results[0][0].dates)/60*60*1000*24>=31)+"rupee");
		   resolve(JSON.stringify(results[0][0].dates));
			 });
		  });
})
},
bookIssue(id,studentid)
{	//console.log(libraryarray,bookarray,id,studentid);
	return new Promise((resolve,reject)=>{
		if(isNaN(id))
		{
			resolve("bookid must be numeric");
		}
		else if(isNaN(studentid))
		{
			resolve("studentid must be numeric");
		}
		else
		{
		pool.getConnection(function(err, connection) {
			connection.query('SELECT student FROM books WHERE id='+id+';',function(error, result, fields){
				if(!result[0])
				{resolve('book with id '+id+' not exist');
				connection.release();	
				}
				else if(result[0].student!==null)
				{	console.log(result);
					resolve('book already issued to student with id:'+result[0].student);
				connection.release();}
				else
				{
					connection.query("select id from students where id="+studentid,(err,result,fields)=>{
					if(err) throw err;
					if(result.length<1)
					{resolve("student with id "+studentid+" not exist");
					connection.release();
					return;
					}	
						connection.query('CALL book_issue('+id+','+Date.now()+','+studentid+')', function (error, results, fields) {
							if (error) reject(error);
						 console.log(JSON.stringify(results));
						 resolve('book issue');
						 connection.release();	 
						});
					})
					
					}
			})
			
		
			});
		}
	});
},
createStudent(name,uname,pass)
{
	console.log('hello');
	return new Promise((resolve,reject)=>{
		pool.getConnection(function(err, connection) {
			connection.query('INSERT INTO students (username,fullname,password) VALUES ("'+uname+'","'+name+'","'+pass+'")', function (error, results, fields) {
			  connection.release();
			  if (error) resolve(error);
			  console.log('hello');
		   resolve(results);
			 });
		  });
})		
},
studentLogin(username,password){
	return new Promise((resolve,reject)=>{
		pool.getConnection(function(err, connection) {
			connection.query('SELECT * FROM students WHERE username ="'+username+'"', function (error, results, fields)
			 {
			  connection.release();
			  if (error) reject(error);
			  console.log(results);
			  if(results.length<1)
			  {resolve("user not found");
			  return;
				}
			  else if(results[0].password!=password)
			  {resolve("password is incorrect");
			  return;
			} 
			  let tokn = jwt.sign({
				username 
			  }, config.secret, { expiresIn: '1h' });
			  resolve(results[0].fullname+" is logged in with token "+tokn);
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
 	  }, config.secret, { expiresIn: '99h' });
 	  resolve(username+" is logged in with token "+tokn);
	
 });
 },
 createBook(title,author,number)
 {
	return new Promise((resolve,reject)=>{
		pool.getConnection(function(err, connection) {
			connection.query("SELECT * FROM library WHERE title='"+title+"' AND author='"+author+"'", function (error, results, fields)
			 {
			  if (error) reject(error);
			  if(results.length>0)
			  {
				connection.query("call dupbook ("+results[0].id+","+number+")", function (error, results, fields){
				if(err)
				throw err;
					resolve("book added");
					connection.release();	
				});

			  }
			  else
			  {
				connection.query("call add_book ('"+title+"','"+author+"',"+number+")", function (error, results, fields){
					if(err)
					throw err;
						resolve("book added");
						connection.release();	
					});
			  }
			   
			});
		  });
 });
}
}
