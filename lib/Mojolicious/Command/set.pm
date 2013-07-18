package Mojolicious::Command::set;

use Mojo::Base -strict;
use Mojo::Base 'Mojolicious::Command';
use Mojo::Loader;
use Mojo::JSON;
use Data::Dumper;
$Data::Dumper::Terse = 0;
$Data::Dumper::Pair = ':';

has 'description' => "изменение значений для датчиков и триггеров";

has 'usage' => <<"EOF";

usage: $0 set (trigger|item) id value

EOF


sub run {
    my ($self, @args) = @_;
    
    my $items = $self->app->model->zabbix->db->get_collection('items');
	my $triggers = $self->app->model->zabbix->db->get_collection('triggers');

    if($args[0] eq 'trigger'){
    	$self->app->log->info("set trigger $args[1]");
    	$self->app->log->info($triggers->update(
    	    {
    	    	id => $args[1]
    	    }, 
    	    {
    	    	'$set' => {
	    	    	status => $args[2],
	    	    	value => $args[2],
	    	    	($args[2] ? (last_time => time()) : ())
	    	    }
    		}
    	));
    	$self->app->log->info(Dumper($triggers->find_one({id => $args[1]})));
    }
    elsif($args[0] eq 'item'){
    	$items->insert({
    		id => $args[1], 
    		x => time(), 
    		y => sprintf('%0.2f', $args[2]+0)
    	});
    }

}




1;