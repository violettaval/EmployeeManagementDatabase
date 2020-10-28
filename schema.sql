create database role_management_db;
use role_management_db;
create table employee (
id integer unsigned auto_increment,
first_name varchar(30) not null,
last_name varchar(30) not null,
role_id integer unsigned not null,
manager_id integer unsigned,
primary key (id)

);
create table role (
id integer unsigned auto_increment,
title varchar(30) unique not null,
salary decimal unsigned not null,
department_id integer unsigned not null,
primary key (id)
);
create table department (
id integer unsigned auto_increment,
name varchar(30) unique not null,
primary key (id)
);