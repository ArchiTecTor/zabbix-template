package Monitoring::Model::Graph;
use Mojo::Base -strict;
use Mojo::Base 'Monitoring::Model::Base';
use Data::Dumper;

sub get {
	my $self = shift;
	my $find = shift;
	my @result;
	
	my $graph_id = delete $find->{id};
	my $items = delete $find->{items};
	my %item_params;
	if($find->{period}){
		$item_params{x} = {
			'$lte' => time(),
			'$gte' => time() - $find->{period}
		};
	}
	my $col = $self->db->get_collection('items');
	for my $item (@$items){
		my @data;
		my $req = $col->query({id => $item, %item_params})->fields({x=>1, y=>1, '_id' => 0})->sort({x=>1});
		my $prev;
		my $obj;
		while($obj = $req->next()){
			push @data, [$obj->{x}+0, $obj->{y}+0];
			next;
			if(!defined($obj->{y})) {
				next;
			}

			if(!defined($prev)){
				push @data, [$obj->{x}+0, $obj->{y}+0];
			}
			elsif(defined($prev) && $obj->{y} != $prev->{y}){
				push @data, [$prev->{x}+0, $prev->{y}+0];
				push @data, [$obj->{x}+0, $obj->{y}+0];
			}
			$prev = $obj;

		}
		push @data, [$prev->{x}+0, $prev->{y}+0] if(defined $prev);
		push @result, \@data if(scalar @data);
	}
	return \@result if(scalar @result);
	return undef;
}

1;