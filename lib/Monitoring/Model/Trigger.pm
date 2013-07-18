package Monitoring::Model::Trigger;
use Mojo::Base -strict;
use Mojo::Base 'Monitoring::Model::Base';
use Data::Dumper;



sub get {
	my $self = shift;
	my $find = shift;
	my @result;
	
	my $trigger = $self->db->get_collection('triggers')->find_one({id => $find->{trigger}{id}}, {'_id' => 0});
	return undef unless($trigger);
	$trigger->{last_time} ||= 0;
	$trigger->{old_secs} = time() - $trigger->{last_time};
	
	return $trigger;
}

sub register_to_update {
	my $self = shift;
	my $params = shift;
	$params = [$params] unless(ref $params eq 'ARRAY');

	my $col = $self->db->get_collection('autoupdate');
	for my $param (@$params){
		$param->{type} = 'trigger';
		$col->save($param);
	}
}


1;