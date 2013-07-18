package Mojolicious::Command::worker;

use Mojo::Base -strict;
use Mojo::Base 'Mojolicious::Command';
use Mojo::Loader;

has 'description' => "Запуск воркера приложения";

has 'usage' => <<"EOF";

usage: $0 worker <name>

EOF


sub run {
    my ($self, @args) = @_;

    my $loader = new Mojo::Loader();
    my $e = $loader->load("Monitoring::Worker::$args[0]");

    die qq{Loading "Monitoring::Worker::$args[0]" failed: $e} if ref $e;
    my %additional;

    if($args[0] eq 'Zabbix'){
    	%additional = (zabbix_id => ($args[1] ? $args[1] : 'zabbix'));
    }
    my $obj = "Monitoring::Worker::$args[0]"->new(app => $self->app, %additional);
    $obj->loop();
}



1;