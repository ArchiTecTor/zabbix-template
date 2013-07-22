zabbix-template
===============

визиуализатор графиков и триггеров zabbix в виде отдельного приложения

в качестве базы данных для хранения кешируемых данных с zabbix используется mongodb

проект написан с исльзованием perl фреймворка Mojolicious

INSTALL AND RUN:

mongoimport --db monitoring --collection system.indexes < ./dumps/monitoring/system.indexes.json

cp ./monitoring.conf.example ./monitoring.conf

vim ./monitoring.conf

hypnotoad ./script/monitoring

screen ./script/monitoring worker Zabbix zabbix 


датчики и триггеры которые будут использоваться необходимо вписывать в шаблоны,
пример работающей конфигурации в ./templates/root/index.html.ep

