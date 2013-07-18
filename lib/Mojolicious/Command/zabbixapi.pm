package Mojolicious::Command::zabbixapi;

use Mojo::Base -strict;
use Mojo::Base 'Mojolicious::Command';
use Mojo::Loader;
use Mojo::JSON;
use Data::Dumper;
$Data::Dumper::Terse = 0;
$Data::Dumper::Pair = ':';

has 'description' => "Выполение команд на zabbix";

has 'usage' => <<"EOF";

usage: $0 zabbix-api {json} [conf_zabbix_id]

EOF


sub run {
    my ($self, @args) = @_;
    my $json = new Mojo::JSON();
    my $params = $json->decode($args[0]);
    print Dumper($params)."\n";
    $self->app->model->zabbix->zabbix_conf_id($args[1] || 'zabbix');
    my $result = $self->app->model->zabbix->query(%$params);

    print Dumper($result);

}




1;