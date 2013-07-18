package Monitoring::Model::Base;
use Mojo::Base -base;
use Mojo::Base -strict;
use MongoDB;
use Data::Dumper;

has 'config';
has 'log';

has 'collection';

has 'db' => sub{
	my $self = shift;
	my $db = new MongoDB::MongoClient(host => $self->config->{db_host});
	$db->get_database($self->config->{db_database});
};

sub get {
	my $self = shift;
	my $find = shift;
	my $col = $self->db->get_collection($self->collection);
	my $result = {};
	my $ids = delete $find->{id};
	for my $id (@$ids) {
		$find->{id} = $id;
		$result->{$id} = [$col->find($find)->all()];
	}
}

sub register_to_update {
	my $self = shift;
	my $params = shift;
	$params = [$params] unless(ref $params eq 'ARRAY');

	my $col = $self->db->get_collection('autoupdate');
	for my $param (@$params){
		
		$col->save($param);
	}
}

1;